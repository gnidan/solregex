import type { NFA } from "../nfa";
import { DFAGenerator } from "./generator";

export { DFA } from "./dfa";

export function dfaFromNFA(nfa: NFA) {
  return new DFAGenerator(nfa).dfa;
}

