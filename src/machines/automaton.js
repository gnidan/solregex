const Graph = require('graph.js/dist/graph.full.js');


let {State} = require('./state');

const INITIAL_STATE_ID = 0x1;

class FiniteAutomaton {
  constructor(startStateOptions) {
    this._nextStateId = INITIAL_STATE_ID;

    // initialize underlying graph data structure
    this._graph = new Graph();

    // create start state, using options provided in constructor
    this._start = this.addState(startStateOptions);
  }

  get start() {
    return this._start;
  }

  get nextStateId() {
    let id = this._nextStateId;
    this._nextStateId += 1;

    return id;
  }

  addState(options) {
    options = options || {};
    options.accepting = options.accepting || false;

    let id = this.nextStateId;
    this._graph.addVertex(id, new State(id, options));

    return id;
  }

  addTransition(from, to, transition) {
    let existingTransition = this._graph.edgeValue(from, to);
    if (existingTransition) {
      transition = existingTransition.or(transition);
    }

    this._graph.addEdge(from, to, transition);
  }

  *states() {
    for (let entry of this._graph.vertices()) {
      yield entry[1];
    }
  }

  *transitionsFrom(from) {
    for (let record of this._graph.verticesFrom(from)) {
      yield {
        to: record[0],
        transition: record[2]
      };
    }
  }

  stateDescription(state) {
    return this._graph.vertexValue(state);
  }
}

module.exports = {
  FiniteAutomaton
};
