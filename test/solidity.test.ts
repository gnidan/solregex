import assert from "assert";
import { describe, it } from "@jest/globals";

import { SolidityDFAWriter } from "../src/solidity/dfa";
import { dfaFromNFA } from "../src/dfa";
import { nfaFromRegex } from "../src/nfa";

const solc: any = require("solc"); /* eslint-disable-line */

describe("Solidity Output", function() {
  it("should have contract name", function() {
    const regex = "[a-z]";
    const nfa = nfaFromRegex(regex);
    const dfa = dfaFromNFA(nfa);
    const writer = new SolidityDFAWriter();

    const output = writer.write(dfa, {regex}).trim();

    assert.notEqual(output.indexOf("library Regex"), -1);
  });

  it("should compile without error", function() {
    const nfa = nfaFromRegex("[a-zA-Z0-9]+@[a-zA-Z0-9]+");
    const dfa = dfaFromNFA(nfa);
    const writer = new SolidityDFAWriter();

    const solidity = writer.write(dfa).trim();

    const evm = solc.compile(solidity);

    assert.ok(!evm.errors);
    assert.ok(Object.keys(evm.contracts).includes(":Regex"));
  }, 10000);
});
