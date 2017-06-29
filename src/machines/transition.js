let {Union} = require('./matchClass');

class Transition {
  constructor(matchClass) {
    this._matchClass = matchClass;
  }

  matches(character) {
    return this._matchClass.matches(character);
  }

  or(other) {
    return new Transition(new Union(this._matchClass, other._matchClass));
  }

  get matchIntervals() {
    return this._matchClass.intervals;
  }

  toString() {
    return this._matchClass.toString();
  }
}


module.exports = {
  Transition
};
