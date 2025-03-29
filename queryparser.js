export class QueryParser {

  constructor(query) {
    this.query = query.trim();
    this.tokens = [];
    this.state = "START";
    this.Tokenize();
  }

  static IsLiteral(token) {
    return !/^(SELECT|FROM|WHERE|LIKE)$/i.test(token);
  }

  IsValidState() {
    return /^(VAL|TABLE)$/i.test(this.state);
  }

  Tokenize() {
    const matches = this.query.match(/(\b\w+\b)|('(?:[^']*|'')*')|(".*?")|(\W)/g);
    if(!matches) return;
    this.tokens = matches.filter(entry => entry.trim());
  }

  Parse() {
    const parsed = {fields: [], from: null, where: {field: null, pattern: null}};
    for(const token of this.tokens) {
      if(this.state === "START" && /^SELECT$/i.test(token)) this.state = "SELECT_FIELD";
      else if(this.state === "SELECT_FIELD" && QueryParser.IsLiteral(token)) parsed.fields.push(token);
      else if(this.state === "SELECT_FIELD" && /^FROM$/i.test(token)) this.state = "FROM";
      else if(this.state === "FROM" && QueryParser.IsLiteral(token)) {
        this.state = "TABLE";
        parsed.from = token;
      }
      else if(this.state === "TABLE" && /^WHERE$/i.test(token)) this.state = "WHERE";
      else if(this.state === "WHERE" && QueryParser.IsLiteral(token)) {
        this.state = "WHERE_FIELD";
        parsed.where.field = token;
      }
      else if(this.state === "WHERE_FIELD" && /^LIKE$/i.test(token)) this.state = "LIKE";
      else if(this.state === "LIKE" && QueryParser.IsLiteral(token)) {
        this.state = "VAL";
        parsed.where.pattern = token;
      }
    }
    if(!this.IsValidState()) throw new Error("Invalid query");
    return parsed;
  }

}