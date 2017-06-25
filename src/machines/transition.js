var {Visitor} = require('../visitor');

class Transition {
  constructor(matchClass) {
    this._matchClass = matchClass;
  }

  matches(character) {
    return this._matchClass.matches(character);
  }
}

class MatchClass {

  /* abstract */
  matches(character) {
    throw new Error("Tried to match abstract " + this + "against character " + character);
  }
}

class Symbol extends MatchClass {
  constructor(codePoint) {
    super();
    this._codePoint = codePoint;
  }

  matches(character) {
    return this._codePoint === character.codePointAt(0);
  }
}

class Wildcard extends MatchClass {
  matches() {
    return true;
  }
}

class Range extends MatchClass {
  constructor(minCodePoint, maxCodePoint) {
    super();
    this._minCodePoint = minCodePoint;
    this._maxCodePoint = maxCodePoint;
  }

  matches(character) {
    var codePoint = character.codePointAt(0);

    return codePoint >= this._minCodePoint && codePoint <= this._maxCodePoint;
  }
}

class Union extends MatchClass {
  constructor(...classes) {
    super();
    this._classes = classes;
  }

  matches(character) {
    var matches = this._classes.reduce(
      (matched, opt) => matched || opt.matches(character), false
    );

    return matches;
  }

}

class Negation extends MatchClass {
  constructor(matchClass) {
    super();
    this._matchClass = matchClass
  }

  matches(character) {
    return !this._matchClass.matches(character);
  }
}

class MatchClassVisitor extends Visitor {
  visit(transitionNode) {
    return this.walk(transitionNode);
  }

  visitValue(value) {
    return new Symbol(value.codePoint);
  }

  visitCharacterClass(characterClass) {
    let union = new Union(
      ...characterClass.body.map(sub => this.walk(sub))
    );

    if (characterClass.negative) {
      return new Negation(union);
    }

    return union;
  }

  visitCharacterClassRange(characterClassRange) {
    return new Range(
      characterClassRange.min.codePoint, characterClassRange.max.codePoint
    );
  }

  visitDot() {
    return new Wildcard();
  }
}


module.exports = {
  Transition,
  MatchClassVisitor,
  Symbol,
  Wildcard,
  Range,
  Union,
  Negation
};
