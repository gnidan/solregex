import { FiniteAutomaton } from "../machines";

export class DFA extends FiniteAutomaton {
  nextState(from: number, on: string) {
    let next = null;

    // console.log("from:", from, "on:", on.codePointAt(0));
    for (const {to, transition} of this.transitionsFrom(from)) {
      // console.log("  - to:", to, "on:", transition);
      if (transition && transition.matches(on)) {
        next = to;

        // determinism affords short-circuit
        break;
      }
    }

    return next;
  }

  *process(input: string) {
    let cur: number | null = this.start;
    yield cur;

    for (let i = 0; i < input.length; i++) {
      const character = input[i];
      cur = this.nextState(cur, character);
      yield cur;

      if (!cur) {
        break;
      }
    }
  }

  matches(input: string): boolean {
    const gen = this.process(input);
    let result = null
    for (const step of gen) {
      result = step;
    }

    if (!result) {
      return false;
    }

    const stateDescription = this.stateDescription(result);
    if (!stateDescription) {
      return false;
    }

    return stateDescription.accepts;
  }
}
