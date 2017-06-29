const {Visitor} = require('../visitor');
const {IntervalTree} = require('node-interval-tree');

const MIN_CODEPOINT = 0x00
const MAX_CODEPOINT = 0xFF

class MatchClass {

  /* abstract */
  matches(character) {
    throw new Error("Tried to match abstract " + this + "against character " + character);
  }

  /* abstract */
  get intervals() {
    throw new Error("Tried to retrieve intervals for abstract " + this);
  }

  toString() {
    return Array.from(this.intervals).
      map(([low, high]) => {
        if (low === MIN_CODEPOINT && high === MAX_CODEPOINT) {
          return ".";
        }

        if (low === MIN_CODEPOINT) {
          low = "\\0";
        } else if (low === MAX_CODEPOINT) {
          low = '\\255';
        } else {
          low = String.fromCodePoint(low);
        }

        if (high === MIN_CODEPOINT) {
          high = "\\0";
        } else if (high === MAX_CODEPOINT) {
          high = "\\255";
        } else {
          high = String.fromCodePoint(high);
        }

        if (low === high) {
          return low;
        }

        return "[" + low + "-" + high + "]";
      }).
      join("|");
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

  get intervals() {
    return new Set([
      [this._codePoint, this._codePoint]
    ]);
  }
}

class Wildcard extends MatchClass {
  matches() {
    return true;
  }

  get intervals() {
    return new Set([
      [MIN_CODEPOINT, MAX_CODEPOINT]
    ]);
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

  get intervals() {
    return new Set([
      [this._minCodePoint, this._maxCodePoint]
    ]);
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

  get intervals() {
    let intervals = new Set();
    for (let termIntervals of this._classes.map(term => term.intervals)) {
      for (let interval of termIntervals) {
        intervals.add(interval);
      }
    }

    return intervals;
  }
}

class Intersection extends MatchClass {
  constructor(...classes) {
    super();
    this._classes = classes;
  }

  matches(character) {
    var matches = this._classes.reduce(
      (matched, opt) => matched && opt.matches(character), true
    );

    return matches
  }

  get intervals() {
    let intersection = new Set();

    let intervalUnions = [new Set([[MIN_CODEPOINT, MAX_CODEPOINT]])].
      concat(this._classes.map(term => term.intervals));

    let intervalTrees = intervalUnions.
      map(union => {
        let tree = new IntervalTree();
        for (let [m, n] of union) {

          // interval tree requires [m,n] m != n, treating intervals
          // as [m, n+1)
          tree.insert({
            low: m,
            high: n
          });
        }

        return tree;
      });

    // console.log("trees", ...intervalTrees.map(tree => tree.toString()));

    let breakpoints = new Set();
    for (let union of intervalUnions) {
      for (let [m, n] of union) {
        breakpoints.add(m - 0.5);
        breakpoints.add(n + 0.5);
      }
    }

    let sorted = Array.from(breakpoints).sort((a, b) => a - b);

    for (let i = 0; i < sorted.length - 1; i++) {

      /* check each elementary interval for inclusion in every union */
      let left = Math.ceil(sorted[i]);
      let right = Math.floor(sorted[i + 1]);

      // console.log("checking interval", "[" +
      //               String.fromCodePoint(left) + "-" +
      //               String.fromCodePoint(right) + "]");

      let treesIncluding = intervalTrees.
        filter(tree => {
          let overlapping = tree.search(left, right);
          let contained = overlapping.
            filter(interval => interval.low <= left && interval.high >= right);

          return contained.length > 0;
        });

      if (treesIncluding.length === intervalTrees.length) {
        intersection.add([left, right]);
      }
    }

    return intersection;
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

  get intervals() {
    let negations = [];

    for (let [min, max] of this._matchClass.intervals) {
      let negation = new Set();
      if (min > MIN_CODEPOINT) {
        negation.add(new Range(MIN_CODEPOINT, min - 1));
      }
      if (max < MAX_CODEPOINT) {
        negation.add(new Range(max + 1, MAX_CODEPOINT));
      }

      negations.push(new Union(...negation));
    }

    return new Intersection(...negations).intervals;
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
  MatchClassVisitor,
  Symbol,
  Wildcard,
  Range,
  Union,
  Intersection,
  Negation
};
