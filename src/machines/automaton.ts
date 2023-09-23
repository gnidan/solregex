import { State, type StateOptions } from "./state";
import type { Transition } from "./transition";

const Graph: any = require('graph.js/dist/graph.full.js'); /* eslint-disable-line */
interface Graph<K, N, E> {
  addVertex(id: K, node: N): void;
  addEdge(from: K, to: K, edge: E): void;

  vertexValue(id: K): N | undefined;
  edgeValue(from: K, to: K): E | undefined;

  vertices(): Iterable<[id: K, node: N]>;
  verticesFrom(from: K): Iterable<[id: K, node: N, edge: E]>;
}


type Id = number;

const INITIAL_STATE_ID: Id = 0x1;

export class FiniteAutomaton {
  private _graph: Graph<Id, State, Transition | null>;
  private _nextStateId: Id;
  private _start: Id;

  constructor(startStateOptions: StateOptions = {}) {
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
    const id = this._nextStateId;
    this._nextStateId += 1;

    return id;
  }

  addState(options: StateOptions = {}) {
    options.accepting = options.accepting || false;

    const id = this.nextStateId;
    this._graph.addVertex(id, new State(id, options));

    return id;
  }

  addTransition(from: Id, to: Id, transition: Transition | null) {
    const existingTransition = this._graph.edgeValue(from, to);
    if (existingTransition) {
      transition = existingTransition.or(transition);
    }

    this._graph.addEdge(from, to, transition);
  }

  *states() {
    for (const entry of this._graph.vertices()) {
      yield entry[1];
    }
  }

  *transitionsFrom(from: Id) {
    for (const [to, _, transition] of this._graph.verticesFrom(from)) {
      yield {
        to,
        transition
      };
    }
  }

  stateDescription(state: Id) {
    return this._graph.vertexValue(state);
  }
}
