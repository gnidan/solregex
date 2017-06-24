/* eslint no-console: 0 */

'use strict';

var RegParser = require('automata.js');
var ArgumentParser = require('argparse').ArgumentParser;

require('./nfa.js');

var VERSION = require('../package.json').version;

let template = (name, initial, stateSpecs, transitionSpecs) => `pragma solidity ^0.4.11;

contract ${name} {
  struct State {
    bool accepts;

    mapping (byte => uint) next;
  }

  mapping (uint => State) states;
  uint constant INITIAL_STATE_ID = ${initial};

  function matches(string input) constant returns (bool) {
    var state = states[INITIAL_STATE_ID];

    for (var i = 0; i < bytes(input).length; i++) {
      var b = bytes(input)[i];

      var next = state.next[b];

      if (next == 0) { // no known next state for input, reject
        return false;
      }

      state = states[next];
    }

    // end of string, current state indicates acceptance
    return state.accepts;
  }

  function ${name}() {${stateSpecs}
${transitionSpecs}
  }
}`;

let stateSpec = (id, accepts) => `
    states[${id}].accepts = ${accepts ? "true" : "false"};`;

let transitionSpec = (from, via, to) => `
    states[${from}].next['${via}'] = ${to};`;


function normalizeStateID(id) {
  return Number.parseInt(id) + 1
}

function generateSolidity(name, regex) {
  let parser = new RegParser.RegParser(regex);
  let dfa = parser.parseToDFA();

  name = name || "RegexMatcher";

  let acceptingStates = new Set(dfa.acceptStates.map(normalizeStateID));

  let initial = normalizeStateID(dfa.initialState);

  let stateSpecs = "";
  for (var i = 1; i <= dfa.numOfStates; i++) {
    let accepts = acceptingStates.has(i);

    stateSpecs += stateSpec(i, accepts);
  }

  let transitionSpecs = "";
  Object.keys(dfa.transitions).forEach(function(from) {
    Object.keys(dfa.transitions[from]).forEach(function(to) {
      let via = dfa.transitions[from][to];

      let from_ = normalizeStateID(from);
      let to_ = normalizeStateID(to);

      transitionSpecs += transitionSpec(from_, via, to_);
    });
  });


  return template(name, initial, stateSpecs, transitionSpecs);
}

var argParser = new ArgumentParser({
  version: VERSION,
  addHelp: true,
  description: "Regex Solidity Generator"
});


argParser.addArgument(
  ['-n', '--name'],
  {
    help: "name for generated regex contract"
  }
);

argParser.addArgument(
  "regex",
  {
    help: "regular expression to compile"
  }
);

var args = argParser.parseArgs();

console.log(generateSolidity(args.name, args.regex));
