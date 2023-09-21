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

export type VisitArgsFor<N extends AstNode, A extends unknown[] = unknown[]> = [node: N, ...args: A];

export abstract class Visitor<Result = unknown, Args extends unknown[] = unknown[]> {
  abstract visitDot(...args: VisitArgsFor<Dot, Args>): Result;
  abstract visitCharacterClass(...args: VisitArgsFor<CharacterClass, Args>): Result;
  abstract visitCharacterClassRange(...args: VisitArgsFor<CharacterClassRange, Args>): Result;
  abstract visitDisjunction(...args: VisitArgsFor<Disjunction, Args>): Result;
  abstract visitAlternative(...args: VisitArgsFor<Alternative, Args>): Result;
  abstract visitQuantifier(...args: VisitArgsFor<Quantifier, Args>): Result;
  abstract visitValue(...args: VisitArgsFor<Value, Args>): Result;

  walk(node: AstNode, ...args: Args) {
    const methods = {
      "dot": this.visitDot,
      "characterClass": this.visitCharacterClass,
      "characterClassRange": this.visitCharacterClassRange,
      "disjunction": this.visitDisjunction,
      "alternative": this.visitAlternative,
      "group": this.visitAlternative,
      "quantifier": this.visitQuantifier,
      "value": this.visitValue
    } as const;

    const method = methods[node.type as keyof typeof methods];
    if (method) {
      return Reflect.apply(method, this, ([node] as unknown[]).concat(args));
    }

    throw new Error("Method not found for type: " + node.type);
  }
}
