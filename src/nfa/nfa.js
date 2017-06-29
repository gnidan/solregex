var {FiniteAutomaton} = require('../machines');


const EPSILON = null;


class NFA extends FiniteAutomaton {
  constructor() {
    super();

    // NFA implementation uses single end state to facilitate construction
    this._end = this.addState({accepting: true});
  }

  get end() {
    return this._end;
  }

  epsilonClosure(states) {
    let known = new Set([]);
    let traverse = new Set(states);

    for (let from of traverse) {
      traverse.delete(from);
      known.add(from);

      for (let {to, transition} of this.transitionsFrom(from)) {
        if (transition === EPSILON && !known.has(to)) {
          traverse.add(to);
        }
      }
    }

    return known
  }

  nextStates(from, on) {
    var possible = new Set([]);

    for (let {to, transition} of this.transitionsFrom(from)) {
      if (transition !== EPSILON && transition.matches(on)) {
        possible.add(to);
      }
    }

    return this.epsilonClosure(possible);
  }

  *process(input) {
    var cur = new Set([this.start]);
    cur = this.epsilonClosure(cur);

    yield cur;

    for (var i = 0; i < input.length; i++) {
      var character = input[i];

      // set of sets reduction, blurgh
      cur = new Set([].concat(
        ...Array.from(cur).
          map(state => this.nextStates(state, character)).
          map(states => Array.from(states))
      ));

      yield cur;
    }
  }

  matches(input) {
    var gen = this.process(input);
    let result = [];
    for (let step of gen) {
      result = step;
    }

    return Array.from(result).
      map(key => this.stateDescription(key)).
      filter(state => state.accepts).
      length > 0;
  }
}

module.exports = {
  NFA,
  EPSILON
}
