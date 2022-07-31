import { a } from "../src";
describe("cli", () => {
  it("init", () => {
    expect(a()).toEqual(1);
  });
});
