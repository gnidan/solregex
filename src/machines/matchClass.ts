import { IntervalTree } from "node-interval-tree";
import type {
  AstNode,
  CharacterClass,
  CharacterClassRange,
  Value,
} from "regjsparser";

import { Visitor } from "../ast/visitor";

const MIN_CODEPOINT = 0x00
const MAX_CODEPOINT = 0xFF

export type Interval = [minCodePoint: number, maxCodePoint: number];

export abstract class MatchClass {
  abstract matches(character: string): boolean;
  abstract get intervals(): Set<Interval>;

  toString() {
    return Array.from(this.intervals).
      map(([low, high]) => {
        if (low === MIN_CODEPOINT && high === MAX_CODEPOINT) {
          return ".";
        }

        const lowString = low === MIN_CODEPOINT
          ? "\\0"
          : low === MAX_CODEPOINT
            ? "\\255"
            : String.fromCodePoint(low);

        const highString = high === MIN_CODEPOINT
          ? "\\0"
          : high === MAX_CODEPOINT
            ? "\\255"
            : String.fromCodePoint(high);

        if (low === high) {
          return lowString;
        }

        return `[${lowString}-${highString}]`;
      }).
      join("|");
  }
}

export class Symbol extends MatchClass {
  private _codePoint: number;

  constructor(codePoint: number) {
    super();
    this._codePoint = codePoint;
  }

  matches(character: string) {
    return this._codePoint === character.codePointAt(0);
  }

  get intervals() {
    return new Set([
      [this._codePoint, this._codePoint] as Interval
    ]);
  }
}

export class Wildcard extends MatchClass {
  matches() {
    return true;
  }

  get intervals() {
    return new Set([
      [MIN_CODEPOINT, MAX_CODEPOINT] as Interval
    ]);
  }
}

export class Range extends MatchClass {
  private _minCodePoint: number;
  private _maxCodePoint: number;

  constructor(minCodePoint: number, maxCodePoint: number) {
    super();
    this._minCodePoint = minCodePoint;
    this._maxCodePoint = maxCodePoint;
  }

  matches(character: string) {
    const codePoint = character.codePointAt(0);

    if (codePoint === undefined) {
      return false
    }

    return codePoint >= this._minCodePoint && codePoint <= this._maxCodePoint;
  }

  get intervals() {
    return new Set([
      [this._minCodePoint, this._maxCodePoint] as Interval
    ]);
  }
}

export class Union extends MatchClass {
  private _classes: MatchClass[];

  constructor(...classes: MatchClass[]) {
    super();
    this._classes = classes;
  }

  matches(character: string) {
    const matches = this._classes.reduce(
      (matched, opt) => matched || opt.matches(character), false
    );

    return matches;
  }

  get intervals() {
    const intervals: Set<Interval> = new Set();
    for (const termIntervals of this._classes.map(term => term.intervals)) {
      for (const interval of termIntervals) {
        intervals.add(interval);
      }
    }

    return intervals;
  }
}

export class Intersection extends MatchClass {
  private _classes: MatchClass[];

  constructor(...classes: MatchClass[]) {
    super();
    this._classes = classes;
  }

  matches(character: string) {
    const matches = this._classes.reduce(
      (matched, opt) => matched && opt.matches(character), true
    );

    return matches
  }

  get intervals() {
    const intersection = new Set<Interval>();

    const intervalUnions = [
      new Set([[MIN_CODEPOINT, MAX_CODEPOINT] as Interval])
    ].concat(this._classes.map(term => term.intervals));

    const intervalTrees = intervalUnions.
      map(union => {
        const tree = new IntervalTree();
        for (const [m, n] of union) {

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

    const breakpoints = new Set<number>();
    for (const union of intervalUnions) {
      for (const [m, n] of union) {
        breakpoints.add(m - 0.5);
        breakpoints.add(n + 0.5);
      }
    }

    const sorted = Array.from(breakpoints)
      .sort((a, b) => a - b);

    for (let i = 0; i < sorted.length - 1; i++) {
      /* check each elementary interval for inclusion in every union */
      const left = Math.ceil(sorted[i]);
      const right = Math.floor(sorted[i + 1]);

      // console.log("checking interval", "[" +
      //               String.fromCodePoint(left) + "-" +
      //               String.fromCodePoint(right) + "]");

      const treesIncluding = intervalTrees.
        filter(tree => {
          const overlapping = tree.search(left, right);
          const contained = overlapping.
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

export class Negation extends MatchClass {
  private _matchClass: MatchClass;

  constructor(matchClass: MatchClass) {
    super();
    this._matchClass = matchClass
  }

  matches(character: string) {
    return !this._matchClass.matches(character);
  }

  get intervals() {
    const negations = [];

    for (const [min, max] of this._matchClass.intervals) {
      const negation = new Set<MatchClass>();
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

export class MatchClassVisitor extends Visitor<MatchClass, []> {
  visit(transitionNode: AstNode) {
    return this.walk(transitionNode);
  }

  visitValue(value: Value) {
    return new Symbol(value.codePoint);
  }

  visitCharacterClass(characterClass: CharacterClass) {
    const union = new Union(
      ...characterClass.body.map(sub => this.walk(sub as AstNode))
    );

    if (characterClass.negative) {
      return new Negation(union);
    }

    return union;
  }

  visitCharacterClassRange(characterClassRange: CharacterClassRange) {
    return new Range(
      characterClassRange.min.codePoint, characterClassRange.max.codePoint
    );
  }

  visitDot() {
    return new Wildcard();
  }

  visitQuantifier(): MatchClass {
    throw new Error("Unexpected quantifier visit");
  }

  visitAlternative(): MatchClass {
    throw new Error("Unexpected alternative visit");
  }

  visitDisjunction(): MatchClass {
    throw new Error("Unexpected disjunction visit");
  }

}
