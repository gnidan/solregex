import Handlebars from "handlebars";

import type { NFA } from "../nfa";

import _nfaTemplate from "./templates/nfa.hbs";
const nfaTemplate = Handlebars.compile(_nfaTemplate);

export interface GraphvizNFAWriterOptions {
  name?: string;
  regex?: string;
}

export class GraphvizNFAWriter {
  write(nfa: NFA, options: GraphvizNFAWriterOptions = {}) {
    options.name = options.name || "Regex";

    const statesData = Array.from(nfa.states()).
      map(({id, accepts}) => Object({
          id,
          accepts,
          outputs: Array.from(nfa.transitionsFrom(id))
      }));

    return nfaTemplate({
      states: statesData
    });
  }
}
