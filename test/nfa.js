var assert = require("assert");

var {NFAVisitor} = require("../src/nfa.js");

describe("NFAVisitor", function() {
  it("should accept individual symbols", function() {
    var visitor = new NFAVisitor("a");
    var nfa = visitor.nfa;

    assert.equal(nfa.vertexCount(), 2);
    assert.equal(nfa.edgeCount(), 1);
  });

  it("should accept disjunctions", function() {
    // there should be:
    //    2 * n + 2 states
    // and:
    //    3 * n transitions
    var visitor = new NFAVisitor("a|b");
    var nfa = visitor.nfa;
    assert.equal(nfa.vertexCount(), 6);
    assert.equal(nfa.edgeCount(), 6);

    visitor = new NFAVisitor("a|b|c");
    nfa = visitor.nfa;
    assert.equal(nfa.vertexCount(), 8);
    assert.equal(nfa.edgeCount(), 9);

    visitor = new NFAVisitor("a|b|c|d");
    nfa = visitor.nfa;
    assert.equal(nfa.vertexCount(), 10);
    assert.equal(nfa.edgeCount(), 12);
  });

  it("should accept concatenations", function() {
    var visitor = new NFAVisitor("ab");
    var nfa = visitor.nfa;

    assert.equal(nfa.vertexCount(), 4);
    assert.equal(nfa.edgeCount(), 3);

    visitor = new NFAVisitor("abc");
    nfa = visitor.nfa;

    assert.equal(nfa.vertexCount(), 5);
    assert.equal(nfa.edgeCount(), 4);
  });

  it("should process a single char regex", function() {
    var visitor = new NFAVisitor("a");
    var nfa = visitor.nfa;

    assert.ok(nfa.matches("a"));
    assert.ok(!nfa.matches("b"));
  });

  it("should process a disjunction", function() {
    var visitor = new NFAVisitor("a|b");
    var nfa = visitor.nfa;

    assert.ok(nfa.matches("a"));
    assert.ok(nfa.matches("b"));
    assert.ok(!nfa.matches("c"));
  });

  it("should process concatenations", function() {
    var visitor = new NFAVisitor("ab");
    var nfa = visitor.nfa;

    assert.ok(!nfa.matches("a"));
    assert.ok(!nfa.matches("b"));
    assert.ok(!nfa.matches("ba"));
    assert.ok(nfa.matches("ab"));
  });

  it("should process the concatenation of the disjunction", function() {
    var visitor = new NFAVisitor("(a|b)(c|d)");
    var nfa = visitor.nfa;

    assert.ok(!nfa.matches("ab"));
    assert.ok(!nfa.matches("cd"));
    assert.ok(nfa.matches("ac"));
    assert.ok(nfa.matches("ad"));
    assert.ok(nfa.matches("bc"));
    assert.ok(nfa.matches("bd"));
  });

  it("should process the disjunction of the concatenation", function() {
    var visitor = new NFAVisitor("ab|cd");
    var nfa = visitor.nfa;

    assert.ok(nfa.matches("ab"));
    assert.ok(nfa.matches("cd"));
    assert.ok(!nfa.matches("ac"));
    assert.ok(!nfa.matches("ad"));
    assert.ok(!nfa.matches("bc"));
    assert.ok(!nfa.matches("bd"));
  });
});
