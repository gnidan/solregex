const assert = require("assert");

const {NFAVisitor} = require("../src/nfa");
const {DFAGenerator, splitCollect} = require("../src/dfa/generator");


describe("NFA -> DFA conversion", function() {

  it("should maintain isomorphism", function() {
    const tests = {
      "a": ["a", "b"],
      "a|b": ["a", "b", "ab", "ba"],
      "ab": ["a", "b", "ab", "ba"],
      "[d-f]": ["a", "d", "[", "e", "f", "g", "def"],
      "([a-c]|[d-f])[g-i]": ["adg", "dah", "ad"],
      "[a-cx]0|[d-f]1|[b-e]2|.3|[^bcd]4": [
        "a0", "a1", "a2", "a3", "a4",
        "b0", "b1", "b2", "b3", "b4",
        "x0", "x1", "x2", "x3", "x4",
        "e0", "e1", "e2", "e3", "e4",
        "f0", "f1", "f2", "f3", "f4",
        "y0", "y1", "y2", "y3", "y4",
      ],
      "a*": ["aaa", "aa", "a", ""]
    }

    Object.keys(tests).forEach(regex => {
      const inputs = tests[regex];

      const nfa = new NFAVisitor(regex).nfa;
      const dfa = new DFAGenerator(nfa).dfa;

      inputs.forEach(input => {
        let nfaMatches = nfa.matches(input);
        let dfaMatches = dfa.matches(input);

        assert.equal(
          nfa.matches(input), dfa.matches(input),
          "For regex `" + regex + "`, input `" + input + "` mismatched: " +
            "NFA (" + nfaMatches + "), DFA (" + dfaMatches + ")."
        );
      });
    });
  });
});
