const template = `{{#*inline "nodeLabel"~}}
   <i>s</i><sub><font point-size="8">{{id}}</font></sub>
{{~/inline}}

digraph dfa {
  rankdir = LR;
  size="8,5"

  _START [shape = point, margin = 0, style = invis];


{{#states}}
{{#accepts}}
  node [shape = doublecircle, label = <{{> nodeLabel }}>] S_{{id}};
{{/accepts}}
{{^accepts}}
  node [shape = circle, label = <{{> nodeLabel}}>] S_{{id}};
{{/accepts}}
{{/states}}

  _START -> S_1;

{{#states}}
{{#outputs}}
  S_{{../id}} -> S_{{to}} [ label = "{{transition}}", fontname = "Monospace", fontsize = "8" ];
{{/outputs}}
{{/states}}
}
`;

export default template;
