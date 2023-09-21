import type {
  AstNode,
  Dot,
  CharacterClass,
  CharacterClassRange,
  Disjunction,
  Alternative,
  Quantifier,
  Value,
} from "regjsparser";

import { Transition } from "../machines/transition";
import { MatchClassVisitor } from "../machines/matchClass";

import { Visitor, type VisitArgsFor } from "../ast/visitor";

import { NFA, EPSILON } from "./nfa";

import { parse as parseRegex } from "regjsparser";

type Args = [from: number, to: number];

export class NFAVisitor extends Visitor<void, Args> {
  public nfa: NFA;

  constructor(regex: string) {
    super();

    const pattern = parseRegex(regex, "", {});

    this.nfa = new NFA();
    this.walk(pattern, this.nfa.start, this.nfa.end);
  }

  visitTransition(transitionNode: AstNode, from: number, to: number) {
    const matchClass = new MatchClassVisitor().visit(transitionNode);
    const transition = new Transition(matchClass);
    this.nfa.addTransition(from, to, transition);
  }

  visitValue(...args: VisitArgsFor<Value, Args>) {
    Reflect.apply(this.visitTransition, this, args);
  }

  visitCharacterClass(...args: VisitArgsFor<CharacterClass, Args>) {
    Reflect.apply(this.visitTransition, this, args);
  }

  visitCharacterClassRange(...args: VisitArgsFor<CharacterClassRange, Args>) {
    Reflect.apply(this.visitTransition, this, args);
  }


  visitDot(...args: VisitArgsFor<Dot, Args>) {
    Reflect.apply(this.visitTransition, this, args);
  }

  visitAlternative(alternative: Alternative, from: number, to: number) {
    let curFrom = from;
    let curTo = null;
    alternative.body.forEach((child) => {
      curTo = this.nfa.addState();

      this.walk(child, curFrom, curTo);

      curFrom = curTo;
    });

    if (curTo === null) {
      throw new Error("Unexpected missing `curTo`");
    }

    this.nfa.addTransition(curTo, to, EPSILON);
  }

  visitDisjunction(disjunction: Disjunction, from: number, to: number) {
    disjunction.body.forEach((child) => {
      const from_ = this.nfa.addState();
      this.nfa.addTransition(from, from_, EPSILON);

      const to_ = this.nfa.addState();
      this.nfa.addTransition(to_, to, EPSILON);

      this.walk(child, from_, to_);
    });
  }

  visitQuantifier(quantifier: Quantifier, from: number, to: number) {
    const {min, max} = quantifier;

    let cur = from;

    const statesNeeded = max === undefined ? min : max;
    for (let i = 1; i <= statesNeeded; i++) {
      const state = this.nfa.addState();

      this.walk(quantifier.body[0], cur, state);

      if (i >= min) {
        this.nfa.addTransition(state, to, EPSILON);
      }

      cur = state;
    }

    if (quantifier.max === undefined) {
      const state = this.nfa.addState();
      this.nfa.addTransition(cur, state, EPSILON);
      this.nfa.addTransition(state, to, EPSILON);
      this.walk(quantifier.body[0], state, state);
    }
  }
}
