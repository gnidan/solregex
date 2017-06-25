class Visitor {
  walk(item, from, to) {
    var methods = {
      "dot": this.visitDot,
      "characterClass": this.visitCharacterClass,
      "disjunction": this.visitDisjunction,
      "alternative": this.visitAlternative,
      "group": this.visitAlternative,
      "value": this.visitValue
    };

    var method = methods[item.type];
    if (method) {
      Reflect.apply(method, this, [item, from, to]);
    } else {
      throw new Error("Method not found for type: " + item.type);
    }
  }
}

module.exports = {Visitor};
