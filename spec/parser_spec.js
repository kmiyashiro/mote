var pistachio = require('../pistachio');
var colors = require('colors');

function l(str) {
  console.log(JSON.stringify(str).yellow);
  console.log(pistachio.compile(pistachio.parse(str)).toString());
  console.log();
}

l('');
l('asdf');
l('asdf\n');
l('asdf\r\nqwer\n');
l('\nasdf\r\nqwer\n');
l('    asdf\r\n  qwer\n');
l('{{asdf}}');
l('  {{asdf}}');
l('{{ internal.whitespace   }}');
l('{{!asdf}}');
l('{{>asdf}}');
l('{{#items}}{{/items}}');
l('{{#items}} {{name}} {{> details}} {{/items}}');
l('{{!\nthis\nis\na\ncomment\n}}');
l('{{=| |=}}\n  |tag|\n{{tag}}');
l('{{=<% %>=}}(<%text%>)');
l('Hello, {{subject}}!');
l('{{#a}}\n{{one}}\n{{#b}}\n{{one}}{{two}}\n{{/b}}\n{{one}}\n{{/a}}');
l(' | {{#boolean}} {{! Important Whitespace }}\n {{/boolean}} | \n');
l("#{{#boolean}}\n/\n  {{/boolean}}");
l("{{= | | =}}<|#lambda|-|/lambda|>");
l("{{{ somenode }}}");
