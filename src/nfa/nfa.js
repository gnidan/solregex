var Graph = require('graph.js/dist/graph.full.js');

var {State} = require('../machines/state');

const EPSILON = null;


class NFA {
  constructor() {
    this._nextStateId = 1000;

    this._graph = new Graph();

    this._start = this.addState();
    this._end = this.addState({accepting: true});
  }

  get nextStateId() {
    let id = this._nextStateId;
    this._nextStateId += 1;

    return id;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  addState(options) {
    options = options || {};
    options.accepting = options.accepting || false;

    var id = this.nextStateId;
    var state = new State(id, options);
    this._graph.addVertex(state.id, state);

    return state.id;
  }

  addTransition(from, to, transition) {
    transition = transition || EPSILON;
    this._graph.addEdge(from, to, transition);
  }

  epsilonClosure(states) {
    let known = new Set([]);
    let traverse = new Set(states);

    for (let from of traverse) {
      traverse.delete(from);
      known.add(from);

      for (let record of this._graph.verticesFrom(from)) {
        let to = record[0];
        let transition = record[2];
        if (transition === EPSILON && !known.has(to)) {
          traverse.add(to);
        }
      }
    }

    return known
  }

  nextState(from, on) {
    var possible = new Set([]);

    for (let record of this._graph.verticesFrom(from)) {
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
          map(state => this.nextState(state, character)).
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
      map(key => this._graph.vertexValue(key)).
      filter(state => state.accepts).
      length > 0;

  }


}

module.exports = {
  NFA,
  EPSILON
}
