export interface StateOptions {
  accepting?: boolean;
}

export class State {
  private _id: number;
  private _accepting: boolean;

  constructor(id: number, options: StateOptions = {}) {
    this._id = id;

    this._accepting = options.accepting || false;
  }

  get id() {
    return this._id;
  }

  get accepts() {
    return this._accepting;
  }
}
