const {NFA} = require('./nfa');
const {NFAVisitor} = require('./visitor');

function nfaFromRegex(regex) {
  return new NFAVisitor(regex).nfa;
}

module.exports = {
  nfaFromRegex,
  NFA,
  NFAVisitor
}
