var {FiniteAutomaton} = require('../machines');

class DFA extends FiniteAutomaton {
  nextState(from, on) {
    let next = null;

    // console.log("from:", from, "on:", on.codePointAt(0));
    for (let {to, transition} of this.transitionsFrom(from)) {
      // console.log("  - to:", to, "on:", transition);
      if (transition.matches(on)) {
        next = to;

        // determinism affords short-circuit
        break;
      }
    }

    return next;
  }

  *process(input) {
    var cur = this.start;
    yield cur;

    for (var i = 0; i < input.length; i++) {
      var character = input[i];
      cur = this.nextState(cur, character);
      yield cur;

      if (!cur) {
        break;
      }
    }
  }

  matches(input) {
    var gen = this.process(input);
    let result = [];
    for (let step of gen) {
      result = step;
    }

    return Boolean(result) && this.stateDescription(result).accepts;
  }
}

module.exports = {
  DFA
}
