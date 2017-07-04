
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
      map(({id}) => Object({
        id,
        outputs: Array.from(dfa.transitionsFrom(id)).
          map(({to, transition}) => Object({
            to,
            accepts: dfa.stateDescription(to).accepts,
            matchIntervals: Array.from(transition.matchIntervals).
              map(([low, high]) => Object({
                low,
                high,
                equal: low === high
              }))
          }))
      }));

    return dfaTemplate({
      states: statesData,
      startAccepts: dfa.stateDescription(dfa.start).accepts,
      name: options.name,
      regex: options.regex
    });
  }
}

module.exports = {
  SolidityDFAWriter
}
