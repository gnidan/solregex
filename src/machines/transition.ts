import { type MatchClass, Union } from "./matchClass";

export class Transition {
  private _matchClass: MatchClass;

  constructor(matchClass: MatchClass) {
    this._matchClass = matchClass;
  }

  matches(character: string) {
    return this._matchClass.matches(character);
  }

  or(other: Transition | null) {
    if (other) {
      return new Transition(new Union(this._matchClass, other._matchClass));
    }

    return this;
  }

  get matchIntervals() {
    return this._matchClass.intervals;
  }

  toString() {
    return this._matchClass.toString();
  }
}
