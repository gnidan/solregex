export { NFA } from "./nfa";
import { NFAVisitor } from "./visitor";

export function nfaFromRegex(regex: string) {
  return new NFAVisitor(regex).nfa;
}

export {
  NFAVisitor
}
