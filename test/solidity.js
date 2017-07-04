let assert = require('assert');

let solc = require('solc');

let {SolidityDFAWriter} = require('../src/solidity/dfa');
let {dfaFromNFA} = require('../src/dfa');
let {nfaFromRegex} = require('../src/nfa');


describe("Solidity Output", function() {
  it("should have contract name", function() {
    let regex = "[a-z]";
    let nfa = nfaFromRegex(regex);
    let dfa = dfaFromNFA(nfa);
    let writer = new SolidityDFAWriter();

    let output = writer.write(dfa, {regex}).trim();

    assert.notEqual(output.indexOf("contract Regex"), -1);
  });

  it("should compile without error", function() {
    this.timeout(10000);
    let nfa = nfaFromRegex("[a-zA-Z0-9]+@[a-zA-Z0-9]+");
    let dfa = dfaFromNFA(nfa);
    let writer = new SolidityDFAWriter();

    let solidity = writer.write(dfa).trim();

    var evm = solc.compile(solidity);

    assert.ok(!evm.errors);
    assert.ok(Object.keys(evm.contracts).includes(":Regex"));
  });
});
