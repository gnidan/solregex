/* eslint no-console: 0 */

const { ArgumentParser }: any = require("argparse"); /* eslint-disable-line */

import { version as VERSION } from "../package.json";

import { SolidityDFAWriter } from "../src/solidity/dfa";
import { GraphvizDFAWriter } from "../src/graphviz/dfa";
import { GraphvizNFAWriter } from "../src/graphviz/nfa";
import { dfaFromNFA } from "../src/dfa";
import { nfaFromRegex } from "../src/nfa";


const argParser = new ArgumentParser({
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

argParser.addArgument(
  ["--nfa", "-N"],
  {
    help: "generate output for NFA (only works with --dot)",
    dest: "nfa",
    action: "storeConst",
    constant: true,
    default: false
  }
);

const args = argParser.parseArgs();

const nfa = nfaFromRegex(args.regex);

if (args.nfa) {
  for (const target of args.outputs) {
    if (target !== "graphviz") {
      console.error("Use of --nfa only works with --dot output");
      process.exit(1);
    }

    const writer = new GraphvizNFAWriter();
    const output = writer.write(nfa, {
      name: args.name,
      regex: args.regex
    });

    console.log(output.trim());
  }

  process.exit(0);
}

const dfa = dfaFromNFA(nfa);

const writers = {
  solidity: SolidityDFAWriter,
  graphviz: GraphvizDFAWriter,
} as const;

args.outputs = args.outputs || ["solidity"];

for (const target of args.outputs) {
  const writer = new writers[target as keyof typeof writers]();

  const output = writer.write(dfa, {
    name: args.name,
    regex: args.regex
  });

  console.log(output.trim());
}
