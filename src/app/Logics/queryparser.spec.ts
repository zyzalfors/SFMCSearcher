import { QueryParser } from "./queryparser";

describe("QueryParser", () => {
  it("should create an instance", () => {
    expect(new QueryParser("")).toBeTruthy();
  });
});
