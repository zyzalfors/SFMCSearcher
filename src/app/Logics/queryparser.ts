export class QueryParser {
  private query: string;
  private tokens: string[];
  private state: string;

  public constructor(query: string) {
    this.query = query.trim();
    this.tokens = [];
    this.state = "START";
    this.Tokenize();
  }

  private static IsLiteral(token: string): boolean {
    return !/^(SELECT|FROM|WHERE|LIKE|AND|OR)$/i.test(token);
  }

  private IsValidState(): boolean {
    return /^(WHERE_COND|TABLE)$/i.test(this.state);
  }

  private Tokenize(): void {
    const matches: RegExpMatchArray | null = this.query.match(/(\b\w+\b)|('(?:[^']*|'')*')|(".*?")|(\W)/g);
    if(!matches) return;

    this.tokens = matches.filter((entry: string) => entry.trim());
  }

  private ParseExpr(o: any): any {
    let left: any = this.ParseTerm(o);

    while(o.pos < this.tokens.length && /^AND$/i.test(this.tokens[o.pos])) {
      o.pos++;
      left = {left, op: "AND", right: this.ParseTerm(o)};
    }

    return left;
  }

  private ParseCondition(o: any): any {
    const field: string = this.tokens[o.pos++];
    const op: string = this.tokens[o.pos++];
    const pattern: string = o.isRegex ? this.tokens[o.pos++].replace(/(^'|'$)/g, "") : this.tokens[o.pos++].replace(/(^'|'$)/g, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex: RegExp = o.caseIns ? new RegExp(pattern, "i") : new RegExp(pattern);

    return {field, op, regex};
  }

  private ParseFactor(o: any): any {
    if(this.tokens[o.pos] === "(") {
      o.pos++;
      const ast: any = this.ParseExpr(o);
      o.pos++;
      return ast;
    }

    return this.ParseCondition(o);
  }

  private ParseTerm(o: any): any {
    let left: any = this.ParseFactor(o);

    while(o.pos < this.tokens.length && /^OR$/i.test(this.tokens[o.pos])) {
      o.pos++;
      left = {left, op: "OR", right: this.ParseFactor(o)};
    }

    return left;
  }

  private ParseWhere(pos: number, isRegex: boolean, caseIns: boolean): any {
    try {
      return this.ParseExpr({pos: pos, isRegex: isRegex, caseIns: caseIns});
    }
    catch {
      throw new Error("Invalid query");
    }
  }

  public Parse(isRegex: boolean, caseIns: boolean): any {
    const parsed: any = {fields: [], from: null, where: null};

    for(let i: number = 0; i < this.tokens.length; i++) {
      const token: string = this.tokens[i];

      switch(true) {
        case this.state === "START" && /^SELECT$/i.test(token):
          this.state = "SELECT_FIELD";
          break;

        case this.state === "SELECT_FIELD" && QueryParser.IsLiteral(token):
          parsed.fields.push(token);
          break;

        case this.state === "SELECT_FIELD" && /^FROM$/i.test(token):
          this.state = "FROM";
          break;

        case this.state === "FROM" && QueryParser.IsLiteral(token):
          this.state = "TABLE";
          parsed.from = token;
          break;

        case this.state === "TABLE" && /^WHERE$/i.test(token):
          this.state = "WHERE";
          break;

        case this.state === "WHERE" && QueryParser.IsLiteral(token):
          this.state = "WHERE_COND";
          parsed.where = this.ParseWhere(i, isRegex, caseIns);
          break;
      }
    }

    if(!this.IsValidState()) throw new Error("Invalid query");
    return parsed;
  }

  public static CheckWhere(item: any, where: any, itemCheck: any): boolean {
    switch(where.op) {
      case "AND":
        return QueryParser.CheckWhere(item, where.left, itemCheck) && QueryParser.CheckWhere(item, where.right, itemCheck);

      case "OR":
        return QueryParser.CheckWhere(item, where.left, itemCheck) || QueryParser.CheckWhere(item, where.right, itemCheck);

      default:
        return itemCheck(item, where.field, where.regex);
    }
  }
}