const template = `{{#*inline "transitionExpr"~}}
  {{#join matchIntervals " || "~}}
    {{#if equal~}}
  c == {{low}}
    {{~else~}}
  c >= {{low}} && c <= {{high}}
    {{~/if}}
  {{~/join}}
{{~/inline}}
pragma solidity ^0.4.23;

library {{name}} {
  struct State {
    bool accepts;
    function (byte) pure internal returns (State memory) func;
  }

{{#if regex}}
  string public constant regex = "{{{regex}}}";

{{/if}}
  function s0(byte c) pure internal returns (State memory) {
    c = c;
    return State(false, s0);
  }

{{#states}}
  function s{{id}}(byte c) pure internal returns (State memory) {
{{#outputs}}
    if ({{> transitionExpr }}) {
      return State({{accepts}}, s{{to}});
    }
{{/outputs}}
{{^outputs}}
    // silence unused var warning
    c = c;
{{/outputs}}

    return State(false, s0);
  }

{{/states}}
  function matches(string input) public pure returns (bool) {
    State memory cur = State({{startAccepts}}, s1);

    for (uint i = 0; i < bytes(input).length; i++) {
      byte c = bytes(input)[i];

      cur = cur.func(c);
    }

    return cur.accepts;
  }
}
`;

export default template;
