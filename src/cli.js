/* eslint no-console: 0 */

var ArgumentParser = require('argparse').ArgumentParser;

var VERSION = require('../package.json').version;

let {SolidityDFAWriter} = require('./solidity/dfa');
let {GraphvizDFAWriter} = require('./graphviz/dfa');
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

argParser.addArgument(
  ["--sol", "--solidity"],
  {
    help: "write Solidity contract",
    dest: "outputs",
    action: "appendConst",
    constant: "solidity"
  }
);

argParser.addArgument(
  ["--dot", "--graphviz"],
  {
    help: "write DOT graph",
    dest: "outputs",
    action: "appendConst",
    constant: "graphviz"
  }
);

var args = argParser.parseArgs();

var nfa = nfaFromRegex(args.regex);
let dfa = dfaFromNFA(nfa);

const writers = {
  solidity: SolidityDFAWriter,
  graphviz: GraphvizDFAWriter
};


args.outputs = args.outputs || ["solidity"];

for (let target of args.outputs) {
  let writer = new writers[target]();

  let output = writer.write(dfa, {
    name: args.name,
    regex: args.regex
  });

  console.log(output.trim());
}
