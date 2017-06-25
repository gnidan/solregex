class State {
  constructor(id, options) {
    this._id = id;

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
