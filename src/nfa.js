'use strict';

var Graph = require('graph.js/dist/graph.full.js');
var parseRegex = require('regjsparser').parse;

var {Visitor} = require('./visitor');
var {Transition, MatchClassVisitor} = require('./machines/transition');

class State {
  static nextId() {
    if (!State._nextId) {
      State._nextId = 1000;
    }
    var value = State._nextId;
    State._nextId += 1;

    return value;
  }

  constructor(options) {
    this._id = State.nextId();

    options = options || {};
    this._accepting = options.accepting || false;
  }

  get id() {
    return String(this._id);
  }

  get accepts() {
    return this._accepting;
  }
}

const EPSILON = null;

class NFA extends Graph {
  constructor() {
    super();

    this._start = this.createState();
    this._end = this.createState({accepting: true});
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  createState(options) {
    options = options || {};
    options.accepting = options.accepting || false;

    var state = new State(options);
    this.addVertex(state.id, state);

    return state.id;
  }

  epsilonTransition(from, to) {
    this.addEdge(from, to, EPSILON);
  }

  epsilonClosure(states) {
    let known = new Set([]);
    let traverse = new Set(states);

    for (let from of traverse) {
      traverse.delete(from);
      known.add(from);

      for (let record of this.verticesFrom(from)) {
        let to = record[0];
        let transition = record[2];
        if (transition === EPSILON && !known.has(to)) {
          traverse.add(to);
        }
      }
    }

    return known
  }

  transition(from, on) {
    var possible = new Set([]);

    for (let record of this.verticesFrom(from)) {
      let to = record[0];
      let transition = record[2];
      if (transition !== EPSILON && transition.matches(on)) {
        possible.add(to);
      }
    }

    return possible;
  }

  *process(input) {
    var cur = new Set([this._start]);
    cur = this.epsilonClosure(cur);

    yield cur;

    for (var i = 0; i < input.length; i++) {
      var character = input[i];

      // set of sets reduction, blurgh
      cur = new Set([].concat(
        ...Array.from(cur).
          map(state => this.transition(state, character)).
          map(states => Array.from(states))
      ));
      cur = this.epsilonClosure(cur);

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
      map(key => this.vertexValue(key)).
      filter(state => state.accepts).
      length > 0;

  }

}

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
    this.nfa.addNewEdge(from, to, transition);
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
      curTo = this.nfa.createState();

      this.walk(child, curFrom, curTo);

      curFrom = curTo;
    });

    this.nfa.epsilonTransition(curTo, to);
  }

  visitDisjunction(disjunction, from, to) {
    disjunction.body.forEach((child) => {
      var from_ = this.nfa.createState();
      this.nfa.epsilonTransition(from, from_);

      var to_ = this.nfa.createState();
      this.nfa.epsilonTransition(to_, to);

      this.walk(child, from_, to_);
    });
  }
}

module.exports = {
  NFAVisitor
};
