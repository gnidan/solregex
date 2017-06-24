class Visitor {
  walk(item, from, to) {
    var methods = {
      "disjunction": this.visitDisjunction,
      "alternative": this.visitAlternative,
      "group": this.visitAlternative,
      "value": this.visitValue
    };

    var method = methods[item.type];
    if (method) {
      method.apply(this, [item, from, to]);
    } else {
      throw new Error("Method not found for type: " + item.type);
    }
  }
}

module.exports = {Visitor};
