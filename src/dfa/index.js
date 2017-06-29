const {DFA} = require('./dfa');
const {DFAGenerator} = require('./generator');


function dfaFromNFA(nfa) {
  return new DFAGenerator(nfa).dfa;
}

module.exports = {
  DFA,
  dfaFromNFA
}
