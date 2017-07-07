'use strict';

var parseRegex = require('regjsparser').parse;

var {Transition} = require('../machines/transition');
var {MatchClassVisitor} = require('../machines/matchClass');

var {Visitor} = require('../ast/visitor');

var {NFA, EPSILON} = require('./nfa');

class NFAVisitor extends Visitor {
  constructor(regex) {
    super();

    var pattern = parseRegex(regex);

    this.nfa = new NFA();
    this.walk(pattern, this.nfa.start, this.nfa.end);
  }

  visitTransition(transitionNode, from, to) {
    var matchClass = new MatchClassVisitor().visit(transitionNode);
    var transition = new Transition(matchClass);
    this.nfa.addTransition(from, to, transition);
  }

  visitValue(...args) {
    Reflect.apply(this.visitTransition, this, args);
  }

  visitCharacterClass(...args) {
    Reflect.apply(this.visitTransition, this, args);
  }

  visitDot(...args) {
    Reflect.apply(this.visitTransition, this, args);
  }

  visitAlternative(alternative, from, to) {
    var curFrom = from;
    var curTo = null;
    alternative.body.forEach((child) => {
      curTo = this.nfa.addState();

      this.walk(child, curFrom, curTo);

      curFrom = curTo;
    });

    this.nfa.addTransition(curTo, to, EPSILON);
  }

  visitDisjunction(disjunction, from, to) {
    disjunction.body.forEach((child) => {
      var from_ = this.nfa.addState();
      this.nfa.addTransition(from, from_, EPSILON);

      var to_ = this.nfa.addState();
      this.nfa.addTransition(to_, to, EPSILON);

      this.walk(child, from_, to_);
    });
  }

  visitQuantifier(quantifier, from, to) {
    let {min, max} = quantifier;

    let cur = from;

    let statesNeeded = max === undefined ? min : max;
    for (var i = 1; i <= statesNeeded; i++) {
      let state = this.nfa.addState();

      this.walk(quantifier.body[0], cur, state);

      if (i >= min) {
        this.nfa.addTransition(state, to, EPSILON);
      }

      cur = state;
    }

    if (quantifier.max === undefined) {
      let state = this.nfa.addState();
      this.nfa.addTransition(cur, state, EPSILON);
      this.nfa.addTransition(state, to, EPSILON);
      this.walk(quantifier.body[0], state, state);
    }
  }
}

module.exports = {
  NFAVisitor
};
