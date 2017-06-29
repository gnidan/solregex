class State {
  constructor(id, options) {
    this._id = id;

    options = options || {};
    this._accepting = options.accepting || false;
    this._options = options;
  }

  get id() {
    return this._id;
  }

  get accepts() {
    return this._accepting;
  }
}

module.exports = {
  State
}
