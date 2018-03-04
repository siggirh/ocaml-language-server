import * as fs from "fs";
import * as path from "path";
import * as refmt from "../src/bin/server/parser/refmt";

const mocksFolder = "refmt.mocks";
const getDiagnostics = mockFileName => {
  const bsbOutput = fs.readFileSync(path.join(__dirname, mocksFolder, mockFileName), "utf8");
  return refmt.parseErrors(bsbOutput);
};

it('parses messages including "UNKNOWN SYNTAX" errors', () => {
  expect(getDiagnostics("1.txt")).toMatchSnapshot();
});

it("parses regular syntax error messages", () => {
  expect(getDiagnostics("2.txt")).toMatchSnapshot();
});
