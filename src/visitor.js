class Visitor {
  walk(item, ...args) {
    var methods = {
      "dot": this.visitDot,
      "characterClass": this.visitCharacterClass,
      "characterClassRange": this.visitCharacterClassRange,
      "disjunction": this.visitDisjunction,
      "alternative": this.visitAlternative,
      "group": this.visitAlternative,
      "value": this.visitValue
    };

    var method = methods[item.type];
    if (method) {
      return Reflect.apply(method, this, [item].concat(args));
    }

    throw new Error("Method not found for type: " + item.type);
  }
}

module.exports = {Visitor};
