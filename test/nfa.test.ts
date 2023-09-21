import assert from "assert";
import { describe, it } from "@jest/globals";

import { NFAVisitor } from "../src/nfa";

describe("NFAVisitor", function() {
  // TODO decide if these tests should be deleted or to become unit tests
  //
  // it("should accept individual symbols", function() {
  //   var visitor = new NFAVisitor("a");
  //   var nfa = visitor.nfa;

  //   assert.equal(nfa.vertexCount(), 2);
  //   assert.equal(nfa.edgeCount(), 1);
  // });

  // it("should accept disjunctions", function() {
  //   // there should be:
  //   //    2 * n + 2 states
  //   // and:
  //   //    3 * n transitions
  //   var visitor = new NFAVisitor("a|b");
  //   var nfa = visitor.nfa;
  //   assert.equal(nfa.vertexCount(), 6);
  //   assert.equal(nfa.edgeCount(), 6);

  //   visitor = new NFAVisitor("a|b|c");
  //   nfa = visitor.nfa;
  //   assert.equal(nfa.vertexCount(), 8);
  //   assert.equal(nfa.edgeCount(), 9);

  //   visitor = new NFAVisitor("a|b|c|d");
  //   nfa = visitor.nfa;
  //   assert.equal(nfa.vertexCount(), 10);
  //   assert.equal(nfa.edgeCount(), 12);
  // });

  // it("should accept concatenations", function() {
  //   var visitor = new NFAVisitor("ab");
  //   var nfa = visitor.nfa;

  //   assert.equal(nfa.vertexCount(), 4);
  //   assert.equal(nfa.edgeCount(), 3);

  //   visitor = new NFAVisitor("abc");
  //   nfa = visitor.nfa;

  //   assert.equal(nfa.vertexCount(), 5);
  //   assert.equal(nfa.edgeCount(), 4);
  // });

  it("should process a single char regex", function() {
    const visitor = new NFAVisitor("a");
    const nfa = visitor.nfa;

    assert.ok(nfa.matches("a"));
    assert.ok(!nfa.matches("b"));
  });

  it("should process a disjunction", function() {
    const visitor = new NFAVisitor("a|b");
    const nfa = visitor.nfa;

    assert.ok(nfa.matches("a"));
    assert.ok(nfa.matches("b"));
    assert.ok(!nfa.matches("c"));
  });

  it("should process concatenations", function() {
    const visitor = new NFAVisitor("ab");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches("a"));
    assert.ok(!nfa.matches("b"));
    assert.ok(!nfa.matches("ba"));
    assert.ok(nfa.matches("ab"));
  });

  it("should process the concatenation of the disjunction", function() {
    const visitor = new NFAVisitor("(a|b)(c|d)");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches("ab"));
    assert.ok(!nfa.matches("cd"));
    assert.ok(nfa.matches("ac"));
    assert.ok(nfa.matches("ad"));
    assert.ok(nfa.matches("bc"));
    assert.ok(nfa.matches("bd"));
  });

  it("should process the disjunction of the concatenation", function() {
    const visitor = new NFAVisitor("ab|cd");
    const nfa = visitor.nfa;

    assert.ok(nfa.matches("ab"));
    assert.ok(nfa.matches("cd"));
    assert.ok(!nfa.matches("ac"));
    assert.ok(!nfa.matches("ad"));
    assert.ok(!nfa.matches("bc"));
    assert.ok(!nfa.matches("bd"));
  });

  it("should process character classes", function() {
    const visitor = new NFAVisitor("[a]");
    const nfa = visitor.nfa;

    assert.ok(nfa.matches("a"));
    assert.ok(!nfa.matches("b"));
  });

  it("should process negative character classes", function() {
    const visitor = new NFAVisitor("[^a]");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches("a"));
    assert.ok(nfa.matches("b"));
  });

  it("should process character class ranges", function() {
    const visitor = new NFAVisitor("[d-f]");
    const nfa = visitor.nfa;

    assert.ok(nfa.matches("d"));
    assert.ok(nfa.matches("e"));
    assert.ok(nfa.matches("f"));
    assert.ok(!nfa.matches("a"));
    assert.ok(!nfa.matches("b"));
    assert.ok(!nfa.matches("g"));
    assert.ok(!nfa.matches("h"));
  })

  it("should process character class ranges", function() {
    const visitor = new NFAVisitor("[^d-f]");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches("d"));
    assert.ok(!nfa.matches("e"));
    assert.ok(!nfa.matches("f"));
    assert.ok(nfa.matches("a"));
    assert.ok(nfa.matches("b"));
    assert.ok(nfa.matches("g"));
    assert.ok(nfa.matches("h"));
  })

  it("should process dots", function() {
    const visitor = new NFAVisitor(".");
    const nfa = visitor.nfa;

    assert.ok(nfa.matches("a"));
    assert.ok(!nfa.matches("aa"));
  });

  it("should process asterisks", function() {
    const visitor = new NFAVisitor("a*");
    const nfa = visitor.nfa;

    assert.ok(nfa.matches("a"));
    assert.ok(nfa.matches("aa"));
    assert.ok(nfa.matches("aaa"));
    assert.ok(nfa.matches(""));
  });

  it("should process plus signs", function() {
    const visitor = new NFAVisitor("a+");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches(""));
    assert.ok(nfa.matches("a"));
    assert.ok(nfa.matches("aa"));
    assert.ok(nfa.matches("aaa"));
  });

  it("should process question marks", function() {
    const visitor = new NFAVisitor("a?");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches(""));
    assert.ok(nfa.matches("a"));
    assert.ok(!nfa.matches("aa"));
  });


  it("should process quantifiers", function() {
    const visitor = new NFAVisitor("a{3,5}");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches(""));
    assert.ok(!nfa.matches("a"));
    assert.ok(!nfa.matches("aa"));
    assert.ok(nfa.matches("aaa"));
    assert.ok(nfa.matches("aaaa"));
    assert.ok(nfa.matches("aaaaa"));
    assert.ok(!nfa.matches("aaaaaa"));
    assert.ok(!nfa.matches("aaaaaaa"));
  });

  it("should process quantifiers without a maximum", function() {
    const visitor = new NFAVisitor("a{3,}");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches(""));
    assert.ok(!nfa.matches("a"));
    assert.ok(!nfa.matches("aa"));
    assert.ok(nfa.matches("aaa"));
    assert.ok(nfa.matches("aaaa"));
    assert.ok(nfa.matches("aaaaa"));
    assert.ok(nfa.matches("aaaaaa"));
    assert.ok(nfa.matches("aaaaaaa"));
  });

  it("should process exact quantifiers", function() {
    const visitor = new NFAVisitor("a{3}");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches(""));
    assert.ok(!nfa.matches("a"));
    assert.ok(!nfa.matches("aa"));
    assert.ok(nfa.matches("aaa"));
    assert.ok(!nfa.matches("aaaa"));
    assert.ok(!nfa.matches("aaaaa"));
    assert.ok(!nfa.matches("aaaaaa"));
    assert.ok(!nfa.matches("aaaaaaa"));
  });

  it("should process quantifiers with repeated group", function() {
    const visitor = new NFAVisitor("(abc){2,4}");
    const nfa = visitor.nfa;

    assert.ok(!nfa.matches(""));
    assert.ok(!nfa.matches("abc"));
    assert.ok(!nfa.matches("abc"));
    assert.ok(nfa.matches("abcabc"));
    assert.ok(nfa.matches("abcabcabc"));
    assert.ok(nfa.matches("abcabcabcabc"));
    assert.ok(!nfa.matches("abcabcabcabcabc"));
  })
});
