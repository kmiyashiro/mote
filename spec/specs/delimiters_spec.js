// Require pistachio
var pistachio = require('../../pistachio.js');
var colors = require('colors');

// The specs, JSONified
var tests = [
  {
    "name": "Pair Behavior",
    "desc": "The equals sign (used on both sides) should permit delimiter changes.",
    "data": {
      "text": "Hey!"
    },
    "template": "{{=<% %>=}}(<%text%>)",
    "expected": "(Hey!)"
  },
  {
    "name": "Special Characters",
    "desc": "Characters with special meaning regexen should be valid delimiters.",
    "data": {
      "text": "It worked!"
    },
    "template": "({{=[ ]=}}[text])",
    "expected": "(It worked!)"
  },
  {
    "name": "Sections",
    "desc": "Delimiters set outside sections should persist.",
    "data": {
      "section": true,
      "data": "I got interpolated."
    },
    "template": "[\n{{#section}}\n  {{data}}\n  |data|\n{{/section}}\n\n{{= | | =}}\n|#section|\n  {{data}}\n  |data|\n|/section|\n]\n",
    "expected": "[\n  I got interpolated.\n  |data|\n\n  {{data}}\n  I got interpolated.\n]\n"
  },
  {
    "name": "Inverted Sections",
    "desc": "Delimiters set outside inverted sections should persist.",
    "data": {
      "section": false,
      "data": "I got interpolated."
    },
    "template": "[\n{{^section}}\n  {{data}}\n  |data|\n{{/section}}\n\n{{= | | =}}\n|^section|\n  {{data}}\n  |data|\n|/section|\n]\n",
    "expected": "[\n  I got interpolated.\n  |data|\n\n  {{data}}\n  I got interpolated.\n]\n"
  },
  {
    "name": "Partial Inheritence",
    "desc": "Delimiters set in a parent template should not affect a partial.",
    "data": {
      "value": "yes"
    },
    "partials": {
      "include": ".{{value}}."
    },
    "template": "[ {{>include}} ]\n{{= | | =}}\n[ |>include| ]\n",
    "expected": "[ .yes. ]\n[ .yes. ]\n"
  },
  {
    "name": "Post-Partial Behavior",
    "desc": "Delimiters set in a partial should not affect the parent template.",
    "data": {
      "value": "yes"
    },
    "partials": {
      "include": ".{{value}}. {{= | | =}} .|value|."
    },
    "template": "[ {{>include}} ]\n[ .{{value}}.  .|value|. ]\n",
    "expected": "[ .yes.  .yes. ]\n[ .yes.  .|value|. ]\n"
  },
  {
    "name": "Surrounding Whitespace",
    "desc": "Surrounding whitespace should be left untouched.",
    "data": {
    },
    "template": "| {{=@ @=}} |",
    "expected": "|  |"
  },
  {
    "name": "Outlying Whitespace (Inline)",
    "desc": "Whitespace should be left untouched.",
    "data": {
    },
    "template": " | {{=@ @=}}\n",
    "expected": " | \n"
  },
  {
    "name": "Standalone Tag",
    "desc": "Standalone lines should be removed from the template.",
    "data": {
    },
    "template": "Begin.\n{{=@ @=}}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Indented Standalone Tag",
    "desc": "Indented standalone lines should be removed from the template.",
    "data": {
    },
    "template": "Begin.\n  {{=@ @=}}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Standalone Line Endings",
    "desc": "\"\\r\\n\" should be considered a newline for standalone tags.",
    "data": {
    },
    "template": "|\r\n{{= @ @ =}}\r\n|",
    "expected": "|\r\n|"
  },
  {
    "name": "Standalone Without Previous Line",
    "desc": "Standalone tags should not require a newline to precede them.",
    "data": {
    },
    "template": "  {{=@ @=}}\n=",
    "expected": "="
  },
  {
    "name": "Standalone Without Newline",
    "desc": "Standalone tags should not require a newline to follow them.",
    "data": {
    },
    "template": "=\n  {{=@ @=}}",
    "expected": "=\n"
  },
  {
    "name": "Pair with Padding",
    "desc": "Superfluous in-tag whitespace should be ignored.",
    "data": {
    },
    "template": "|{{= @   @ =}}|",
    "expected": "||"
  }
];

// Run the tests
for (var i = 0, len = tests.length; i < len; i++) {
  var test = tests[i];
  var error = undefined;
  var actual = undefined;

  try {
    var actual = pistachio.render(test['template'], test['data']);
  } catch(err) {
    var error = err;
  }

  if (error) {
    console.log(('[ERROR] ' + test.name + ': ' + test.desc).red);
    console.log('  ' + error.toString());
    break;
  } else if (actual !== test['expected']) {
    console.log(('[FAIL] ' + test.name + ': ' + test.desc).red);
    console.log(('  expected:').yellow);
    console.log('    ' + JSON.stringify(test.expected));
    console.log(('  actual:').yellow);
    console.log('    ' + JSON.stringify(actual));
    break;
  } else {
    console.log(('[PASS] ' + test.name + ': ' + test.desc).green);
  }
}
