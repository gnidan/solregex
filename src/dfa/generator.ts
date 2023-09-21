import { IntervalTree } from "node-interval-tree";

import type { NFA } from "../nfa";
import { DFA } from "./dfa";
import { Transition } from "../machines/transition";
import { Range } from "../machines/matchClass";

export class DFAGenerator {
  private _dfa: DFA;

  constructor(nfa: NFA) {
    this._dfa = this.constructDFA(nfa);
  }

  get dfa() {
    return this._dfa;
  }

  constructDFA(nfa: NFA) {
    const unprocessed = new Set<string>();
    const processed = new Set<string>();

    const startStates = nfa.epsilonClosure(new Set([nfa.start]));
    const startKey = this.getStateKey(startStates);
    const startAccepts = Array.from(startStates).
      filter(s => nfa.stateDescription(s)?.accepts).
      length > 0;

    const dfa = new DFA({accepting: startAccepts});

    const dfaRecords = {
      [startKey]: {
        nfaStates: startStates,
        dfaState: dfa.start
      }
    };

    unprocessed.add(startKey);

    for (const fromKey of unprocessed) {
      const fromRecord = dfaRecords[fromKey];

      unprocessed.delete(fromKey);
      processed.add(fromKey);

      // console.log(
      //   "processing", fromRecord.nfaStates,
      //   "(dfa state: " + fromRecord.dfaState + ")");

      const outputs = this.processOutputs(nfa, fromRecord.nfaStates);
      for (const {to, transition} of outputs) {
        if (to.size > 0) {
          const toKey = this.getStateKey(to);

          if (!dfaRecords[toKey]) {
            const accepting = Array.from(to).
              filter(s => nfa.stateDescription(s)?.accepts).
              length > 0;

            dfaRecords[toKey] = {
              nfaStates: to,
              dfaState: dfa.addState({accepting})
            };
          }

          const toRecord = dfaRecords[toKey];

          // console.log(
          //   "from " +
          //     fromRecord.dfaState + " (" + util.inspect(fromRecord.nfaStates) + ") " +
          //   "to " +
          //     toRecord.dfaState + " (" + util.inspect(toRecord.nfaStates) + ") " +
          //   "on " + transition.toString()
          // );
          dfa.addTransition(fromRecord.dfaState, toRecord.dfaState, transition);

          if (!processed.has(toKey) && !unprocessed.has(toKey)) {
            unprocessed.add(toKey);
          }
        }
      }

      // console.log();
    }

    return dfa;

  }

  getStateKey(nfaStates: Iterable<number>) {
    return Array.from(nfaStates).
      sort().
      join(',');
  }

  processOutputs(nfa: NFA, nfaStates: Iterable<number>) {
    const breakpoints = new Set<number>();
    const intervalTrees = new Set<IntervalTree<{ low: number; high: number; name: number }>>();
    const dfaOutputs = new Set<{
      to: Set<number>;
      transition: Transition;
    }>();

    for (const nfaState of nfaStates) {
      for (const output of nfa.transitionsFrom(nfaState)) {
        if (output.transition) {
          const intervalTree = new IntervalTree<{
            low: number;
            high: number;
            name: number;
          }>();

          for (const [m, n] of output.transition.matchIntervals) {
            intervalTree.insert({
              low: m,
              high: n,
              name: output.to
            });

            breakpoints.add(m - 0.5);
            breakpoints.add(n + 0.5);
          }

          intervalTrees.add(intervalTree);
        }
      }
    }

    const sorted = Array.from(breakpoints).sort((a, b) => a - b);

    for (let i = 0; i < sorted.length - 1; i++) {
      const left = Math.ceil(sorted[i]);
      const right = Math.floor(sorted[i + 1]);

      const toNfaStates = new Set<number>();
      for (const intervalTree of intervalTrees) {
        // console.log(intervalTree.toString());
        // console.log(String.fromCodePoint(left), String.fromCodePoint(right));
        // console.log(intervalTree.search(left, right));
        // console.log();

        for (const interval of intervalTree.search(left, right)) {
          toNfaStates.add(interval.name);
        }
      }

      dfaOutputs.add({
        to: nfa.epsilonClosure(toNfaStates),
        transition: new Transition(new Range(left, right))
      });
    }

    return dfaOutputs;
  }
}
