const assert = require('assert');

const {Symbol, Range, Negation, Union, Intersection} = require('../src/machines/matchClass');

function codePoint(character) {
  return character.codePointAt(0);
}

const _a = codePoint("a");
const _b = codePoint("b");
const _c = codePoint("c");
const _d = codePoint("d");
const _e = codePoint("e");
const _f = codePoint("f");
const _g = codePoint("g");
const _h = codePoint("h");
const _i = codePoint("i");


describe("Code-point interval combination", function() {
  it("should return a point for a Symbol", function() {
    let symbol = new Symbol(_a);

    assert.equal(symbol.intervals.size, 1);

    let [m, n] = Array.from(symbol.intervals)[0]
    assert.equal(m, _a);
    assert.equal(n, _a);
  });

  it("should return an empty set for an intersection of non-overlapping ranges", function() {
    /*
     * a b c d e f g h i
     *   \___/   \___/
     *     r       s
     */
    let r = new Range(_b, _d);
    let s = new Range(_f, _h);

    let rs = new Intersection(r, s);

    assert.equal(rs.intervals.size, 0);
  });

  it("should return the overlap for overlapping ranges", function() {
    /*
     * a b c d e f g h i
     *   \_______/
     *     r
     *       \_______/
     *         s
     */
    let r = new Range(_b, _f);
    let s = new Range(_d, _h);

    let rs = new Intersection(r, s);

    let intervals = Array.from(rs.intervals);

    let characters = intervals.
      map(([m, n]) => [String.fromCodePoint(m), String.fromCodePoint(n)])

    assert.equal(intervals.length, 1);
    let [m, n] = intervals[0];

    assert.equal(m, _d);
    assert.equal(n, _f);
  });

  it("should intersect unions correctly", function() {
    /*
     *  . .   . . . .   . .
     *   a b c d e f g h i
     *     \_____/   \___/   u
     *   \___/   \_____/     v
     *
     *  0-a   false
     *  a-a
     *  b-c
     *  d-d
     *  e-e
     *  f-f
     *  g-h
     *  i-i
     *  j-...
     *
     */

    let u = new Union(
      new Range(_b, _e),
      new Range(_g, _i)
    );
    let v = new Union(
      new Range(_a, _c),
      new Range(_e, _h)
    );

    let uv = new Intersection(u, v);
    let intervals = Array.from(uv.intervals);

    let characters = intervals.
      map(([m, n]) => [String.fromCodePoint(m), String.fromCodePoint(n)])


    assert.equal(intervals.length, 3);

    assert.equal(intervals[0][0], _b);
    assert.equal(intervals[0][1], _c);

    assert.equal(intervals[1][0], _e);
    assert.equal(intervals[1][1], _e);

    assert.equal(intervals[2][0], _g);
    assert.equal(intervals[2][1], _h);
  });

  it("should do De Morgan's", function() {
    let u = new Union(
      new Range(_b, _e),
      new Range(_c, _c),
      new Range(_g, _i)
    );
    let v = new Union(
      new Range(_a, _c),
      new Range(_e, _h)
    );

    // !( u | v ) = !u & !v
    let uvNegUnion = new Negation(new Union(u, v));
    let uvIntersectNegs = new Intersection(
      new Negation(u), new Negation(v)
    );

    let intervals1 = Array.from(uvNegUnion.intervals);
    let intervals2 = Array.from(uvIntersectNegs.intervals);

    assert(intervals1.length, intervals2.length);

    for (let i = 0; i < intervals1.length; i++) {
      assert.equal(intervals1[i][0], intervals2[i][0]);
      assert.equal(intervals1[i][1], intervals2[i][1]);
    }

  });

  it("should negate adjacent ranges correctly", function() {
    let u = new Union(
      new Range(_b, _e),
      new Range(_e, _f)
    );

    let notU = new Negation(u);

    let intervals = Array.from(notU.intervals);
    assert(intervals.length, 2);
    assert.equal(intervals[0][1], _a);
    assert.equal(intervals[1][0], _g);
  });

  it("should simplify via double negation", function() {
    let u = new Union(
      new Range(_b, _e),
      new Range(_e, _f)
    );

    let notU = new Negation(u);
    let notNotU = new Negation(notU);

    let intervals = Array.from(notNotU.intervals);
    assert(intervals.length, 1);
    assert.equal(intervals[0][0], _b);
    assert.equal(intervals[0][1], _f);
  });

});
