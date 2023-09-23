import Handlebars from "handlebars";

import type { DFA } from "../dfa";

import _dfaTemplate from './templates/contract.hbs';


Handlebars.registerHelper("join", (array, sep, options) =>
  array.map((item: string) => options.fn(item)).join(sep)
);

const dfaTemplate = Handlebars.compile(_dfaTemplate);

export interface SolidityDFAWriterOptions {
  name?: string;
  regex?: string;
}

export class SolidityDFAWriter {
  write(dfa: DFA, options: SolidityDFAWriterOptions = {}) {
    options.name = options.name || "Regex";

    const statesData = Array.from(dfa.states()).
      map(({id}) => Object({
        id,
        outputs: Array.from(dfa.transitionsFrom(id)).
          map(({to, transition}) => Object({
            to,
            accepts: dfa.stateDescription(to)?.accepts,
            matchIntervals: Array.from(transition?.matchIntervals || []).
              map(([low, high]) => Object({
                low,
                high,
                equal: low === high
              }))
          }))
      }));

    const templateData: {
      states: typeof statesData;
      startAccepts: boolean;
      name: string;
      regex?: string;
    } = {
      states: statesData,
      startAccepts: dfa.stateDescription(dfa.start)?.accepts || false,
      name: options.name,
    }
    if (options.regex) {
      templateData.regex = options.regex.replace("\\", "\\\\");
    }

    return dfaTemplate(templateData);
  }
}
