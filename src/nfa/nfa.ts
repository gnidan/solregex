import { FiniteAutomaton } from "../machines";

export const EPSILON = null;

export class NFA extends FiniteAutomaton {
  private _end: number;

  constructor() {
    super();

    // NFA implementation uses single end state to facilitate construction
    this._end = this.addState({accepting: true});
  }

  get end() {
    return this._end;
  }

  epsilonClosure(states: Set<number>) {
    const known = new Set<number>([]);
    const traverse = new Set(states);

    for (const from of traverse) {
      traverse.delete(from);
      known.add(from);

      for (const {to, transition} of this.transitionsFrom(from)) {
        if (transition === EPSILON && !known.has(to)) {
          traverse.add(to);
        }
      }
    }

    return known;
  }

  nextStates(from: number, on: string) {
    const possible = new Set<number>([]);

    for (const {to, transition} of this.transitionsFrom(from)) {
      if (transition !== EPSILON && transition.matches(on)) {
        possible.add(to);
      }
    }

    return this.epsilonClosure(possible);
  }

  *process(input: string) {
    let cur = new Set([this.start]);
    cur = this.epsilonClosure(cur);

    yield cur;

    for (let i = 0; i < input.length; i++) {
      const character = input[i];

      // set of sets reduction, blurgh
      cur = new Set(Array.prototype.concat(
        ...Array.from(cur).
          map(state => this.nextStates(state, character)).
          map(states => Array.from(states))
      ));

      yield cur;
    }
  }

  matches(input: string) {
    const gen = this.process(input);
    let result = null;
    for (const step of gen) {
      result = step;
    }

    if (!result) {
      throw new Error("Unexpected falsey result");
    }

    return Array.from(result).
      map(key => this.stateDescription(key)).
      filter(state => state?.accepts).
      length > 0;
  }
}
