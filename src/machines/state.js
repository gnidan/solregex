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

module.exports = {
  State
}
