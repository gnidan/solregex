'use strict';

const {IntervalTree} = require('node-interval-tree');

const {DFA} = require('./dfa');
const {Transition} = require('../machines/transition');
const {Range} = require('../machines/matchClass');


class DFAGenerator {
  constructor(nfa) {
    this._dfa = this.constructDFA(nfa);
  }

  get dfa() {
    return this._dfa;
  }

  constructDFA(nfa) {

    let unprocessed = new Set();
    let processed = new Set();

    let startStates = nfa.epsilonClosure(new Set([nfa.start]));
    let startKey = this.getStateKey(startStates);
    let startAccepts = Array.from(startStates).
      filter(s => nfa.stateDescription(s).accepts).
      length > 0;

    let dfa = new DFA({accepting: startAccepts});

    let dfaRecords = {
      [startKey]: {
        nfaStates: startStates,
        dfaState: dfa.start
      }
    };

    unprocessed.add(startKey);

    for (let fromKey of unprocessed) {
      let fromRecord = dfaRecords[fromKey];

      unprocessed.delete(fromKey);
      processed.add(fromKey);

      // console.log(
      //   "processing", fromRecord.nfaStates,
      //   "(dfa state: " + fromRecord.dfaState + ")");

      let outputs = this.processOutputs(nfa, fromRecord.nfaStates);
      for (let {to, transition} of outputs) {
        if (to.size > 0) {
          let toKey = this.getStateKey(to);

          if (!dfaRecords[toKey]) {
            let accepting = Array.from(to).
              filter(s => nfa.stateDescription(s).accepts).
              length > 0;

            dfaRecords[toKey] = {
              nfaStates: to,
              dfaState: dfa.addState({accepting})
            };
          }

          let toRecord = dfaRecords[toKey];

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

  getStateKey(nfaStates) {
    return Array.from(nfaStates).
      sort().
      join(',');
  }

  processOutputs(nfa, nfaStates) {
    let breakpoints = new Set();
    let intervalTrees = new Set();
    let dfaOutputs = new Set();

    for (let nfaState of nfaStates) {
      for (let output of nfa.transitionsFrom(nfaState)) {
        if (output.transition) {
          let intervalTree = new IntervalTree();

          for (let [m, n] of output.transition.matchIntervals) {
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

    let sorted = Array.from(breakpoints).sort((a, b) => a - b);

    for (let i = 0; i < sorted.length - 1; i++) {
      let left = Math.ceil(sorted[i]);
      let right = Math.floor(sorted[i + 1]);

      let toNfaStates = new Set();
      for (let intervalTree of intervalTrees) {
        // console.log(intervalTree.toString());
        // console.log(String.fromCodePoint(left), String.fromCodePoint(right));
        // console.log(intervalTree.search(left, right));
        // console.log();

        for (let interval of intervalTree.search(left, right)) {
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


module.exports = {
  DFAGenerator
}
