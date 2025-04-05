export class QueryParser {

  constructor(query) {
    this.query = query.trim();
    this.tokens = [];
    this.state = "START";
    this.Tokenize();
  }

  static IsLiteral(token) {
    return !/^(SELECT|FROM|WHERE|LIKE|AND|OR)$/i.test(token);
  }

  IsValidState() {
    return /^(WHERE_COND|TABLE)$/i.test(this.state);
  }

  Tokenize() {
    const matches = this.query.match(/(\b\w+\b)|('(?:[^']*|'')*')|(".*?")|(\W)/g);
    if(!matches) return;

    this.tokens = matches.filter(entry => entry.trim());
  }

  ParseWhere(pos, isRegex, caseIns) {
    const ParseTerm = o => {
      let left = ParseFactor(o);

      while(o.pos < this.tokens.length && /^OR$/i.test(this.tokens[o.pos])) {
         o.pos++;
         left = {left, op: "OR", right: ParseFactor(o)};
      }

      return left;
    };

    const ParseExpr = o => {
      let left = ParseTerm(o);

      while(o.pos < this.tokens.length && /^AND$/i.test(this.tokens[o.pos])) {
         o.pos++;
         left = {left, op: "AND", right: ParseTerm(o)};
      }

      return left;
    };

    const ParseCondition = o => {
      const field = this.tokens[o.pos++];
      const op = this.tokens[o.pos++];
      const pattern = o.isRegex ? this.tokens[o.pos++].replace(/(^'|'$)/g, "") : this.tokens[o.pos++].replace(/(^'|'$)/g, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = o.caseIns ? new RegExp(pattern, "i") : new RegExp(pattern);

      return {field, op, regex};
    };

    const ParseFactor = o => {
      if(this.tokens[o.pos] === "(") {
        o.pos++;
        const ast = ParseExpr(o);
        o.pos++;
        return ast;
      }

      return ParseCondition(o);
    };

    try {
      return ParseExpr({pos: pos, isRegex: isRegex, caseIns: caseIns});
    }
    catch(err) {
      throw new Error("Invalid query");
    }
  }

  Parse(isRegex, caseIns) {
    const parsed = {fields: [], from: null, where: null};

    for(const i in this.tokens) {
      const token = this.tokens[i];

      if(this.state === "START" && /^SELECT$/i.test(token)) this.state = "SELECT_FIELD";
      else if(this.state === "SELECT_FIELD" && QueryParser.IsLiteral(token)) parsed.fields.push(token);
      else if(this.state === "SELECT_FIELD" && /^FROM$/i.test(token)) this.state = "FROM";
      else if(this.state === "FROM" && QueryParser.IsLiteral(token)) {
        this.state = "TABLE";
        parsed.from = token;
      }
      else if(this.state === "TABLE" && /^WHERE$/i.test(token)) this.state = "WHERE";
      else if(this.state === "WHERE" && QueryParser.IsLiteral(token)) {
        this.state = "WHERE_COND";
        parsed.where = this.ParseWhere(i, isRegex, caseIns);
        break;
      }
    }

    if(!this.IsValidState()) throw new Error("Invalid query");
    return parsed;
  }

}