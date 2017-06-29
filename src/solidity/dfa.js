
const Handlebars = require('hbsfy/runtime');

Handlebars.registerHelper("join", (array, sep, options) =>
  array.map(item => options.fn(item)).join(sep)
);

const dfaTemplate = require('./templates/contract.hbs');

class SolidityDFAWriter {
  write(dfa, options) {
    options = options || {};

    options.name = options.name || "Regex";

    let statesData = Array.from(dfa.states()).
      map(({id, accepts}) => Object({
        id,
        accepts,
        outputs: Array.from(dfa.transitionsFrom(id)).
          map(({to, transition}) => Object({
            to,
            matchIntervals: Array.from(transition.matchIntervals)
          }))
      }));

    return dfaTemplate({
      states: statesData,
      name: options.name,
      regex: options.regex
    });
  }
}

module.exports = {
  SolidityDFAWriter
}
