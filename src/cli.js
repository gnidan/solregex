/* eslint no-console: 0 */

var ArgumentParser = require('argparse').ArgumentParser;

var VERSION = require('../package.json').version;

let {SolidityDFAWriter} = require('./solidity/dfa');
let {dfaFromNFA} = require('./dfa');
let {nfaFromRegex} = require('./nfa');


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

var nfa = nfaFromRegex(args.regex);
let dfa = dfaFromNFA(nfa);

let writer = new SolidityDFAWriter();

let output = writer.write(dfa, {
  name: args.name,
  regex: args.regex
});

console.log(output.trim());
