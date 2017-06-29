const dfaTemplate = require('./templates/dfa.hbs');

class GraphvizDFAWriter {
  write(dfa, options) {
    options = options || {};

    options.name = options.name || "Regex";

    let statesData = Array.from(dfa.states()).
      map(({id, accepts}) => Object({
          id,
          accepts,
          outputs: Array.from(dfa.transitionsFrom(id))
      }));


    return dfaTemplate({
      states: statesData
    });
  }
}

module.exports = {
  GraphvizDFAWriter
}
