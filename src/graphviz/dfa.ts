import Handlebars from "handlebars";

import type { DFA } from "../dfa";

import _dfaTemplate from "./templates/dfa.hbs";
const dfaTemplate = Handlebars.compile(_dfaTemplate);

export interface GraphvizDFAWriterOptions {
  name?: string;
}

export class GraphvizDFAWriter {
  write(dfa: DFA, options: GraphvizDFAWriterOptions = {}) {
    options.name = options.name || "Regex";

    const statesData = Array.from(dfa.states()).
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
