const assert = require('assert');

const contractTemplate = require('../src/solidity/contract.sol.templ');

describe("Solidity Output", function() {
  it("should load templates correctly", function() {
    let formatted = contractTemplate({contractName: "Regex"});

    assert.ok(formatted.match("contract Regex"));
  });
});
