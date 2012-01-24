var pistachio = require('../pistachio.js');
var colors = require('colors');


function line(str, indentLevel, color) {
  var indent = ''
    , str = color ? str[color] : str;
  while (indentLevel) {
    indent += '  ';
    indentLevel--;
  }
  console.log(indent + str);
}

var stats = {
  error: 0,
  pass: 0,
  fail: 0
}

function tokenize(template) {
  var t = new pistachio.Tokens(template);
  return t.tokens;
}

function runSpec(title, spec) {
  var error, actual
    , expected = JSON.stringify(spec.expected);

  try {
    actual = JSON.stringify(tokenize(spec.template));
  } catch(err) {
    error = err;
  }

  if (error) {
    line('[ERROR] ' + title, 0, 'red');
    line(error.toString(), 1);
    stats.error += 1;
  } else if (actual !== expected) {
    line('[FAIL] ' + title, 0, 'red');
    line('expect: '.yellow + expected, 2);
    line('actual: '.yellow + actual, 2);
    stats.fail += 1;
  } else {
    line('[PASS] ' + title, 0, 'green');
    stats.pass += 1;
  }
}

// The specs

var specs = {
  'Empty string': {
    template: '',
    expected: []
  },

  'Plain text': {
    template: 'the quick brown fox',
    expected: [
      { type: 'text', value: 'the quick brown fox' }
    ]
  },

  'Just whitespace': {
    template: '    ',
    expected: [
      { type: 'text', value: '    ' }
    ]
  },

  'Newline: (\\n)': {
    template: '\n',
    expected: [
      { type: 'newline', value: '\n' }
    ]
  },

  'Newline: (\\r\\n)': {
    template: '\r\n',
    expected: [
      { type: 'newline', value: '\r\n' }
    ]
  },

  'Mixed newlines': {
    template: '\r\n\n',
    expected: [
      { type: 'newline', value: '\r\n' },
      { type: 'newline', value: '\n' }
    ]
  },

  'Mixed text and newlines': {
    template: 'the\nquick\r\nbrown',
    expected: [
      { type: 'text', value: 'the' },
      { type: 'newline', value: '\n' },
      { type: 'text', value: 'quick' },
      { type: 'newline', value: '\r\n' },
      { type: 'text', value: 'brown' },
    ]
  },

  'Simple tag': {
    template: '{{blah}}',
    expected: [
      { type: 'tag', key: 'blah', escape: true }
    ]
  },

  'Simple tag with internal whitespace': {
    template: '{{ blah }}',
    expected: [
      { type: 'tag', key: 'blah', escape: true }
    ]
  },

  'Simple tag with leading whitespace': {
    template: '  {{blah}}',
    expected: [
      { type: 'text', value: '  ' },
      { type: 'tag', key: 'blah', escape: true }
    ]
  },

  'Comment tag': {
    template: '{{! blah }}',
    expected: [
      { type: 'comment' }
    ]
  },

  'Multiline comment tag': {
    template: '{{! blah\nmore blah\neven more blah }}',
    expected: [
      { type: 'comment' }
    ]
  },

  'Mixed comments and plain text': {
    template: 'Hello{{! blah blah }} world',
    expected: [
      { type: 'text', value: 'Hello' },
      { type: 'comment' },
      { type: 'text', value: ' world' }
    ]
  },

  'Triple-stache tag': {
    template: '{{{ blah }}}',
    expected: [
      { type: 'tag', key: 'blah', escape: false }
    ]
  },

  'Ampersand tag': {
    template: '{{& blah }}',
    expected: [
      { type: 'tag', key: 'blah', escape: false }
    ]
  },

  'Section tag: open': {
    template: '{{# open }}',
    expected: [
      { type: 'openTag', key: 'open' }
    ]
  },

  'Section tag: close': {
    template: '{{/ close }}',
    expected: [
      { type: 'closeTag', key: 'close' }
    ]
  },

  'Section tag: invert': {
    template: '{{^ invert }}',
    expected: [
      { type: 'invertTag', key: 'invert' }
    ]
  },

  'Partial tag': {
    template: '{{> partial }}',
    expected: [
      { type: 'partialTag', key: 'partial', indent: '' }
    ]
  },

  'Mixed tags and text': {
    template: '{{#begin}} My name is {{name}}! {{/begin}}',
    expected: [
      { type: 'openTag', key: 'begin' },
      { type: 'text', value: ' My name is ' },
      { type: 'tag', key: 'name', escape: true },
      { type: 'text', value: '! ' },
      { type: 'closeTag', key: 'begin' },
    ]
  },

  'Mixed tags, text, and newlines': {
    template: '{{^begin}} My name is \n{{name}}! {{/begin}}',
    expected: [
      { type: 'invertTag', key: 'begin' },
      { type: 'text', value: ' My name is ' },
      { type: 'newline', value: '\n' },
      { type: 'tag', key: 'name', escape: true },
      { type: 'text', value: '! ' },
      { type: 'closeTag', key: 'begin' },
    ]
  },

  'Strip standalone lines': {
    template: '\n{{#standalone}}\n{{/standalone}}\r\nblah',
    expected: [
      { type: 'newline', value: '\n' },
      { type: 'openTag', key: 'standalone' },
      { type: 'closeTag', key: 'standalone' },
      { type: 'text', value: 'blah' },
    ]
  },

  'Strip indented standalone lines': {
    template: '\n  {{#standalone}}\n   {{/standalone}}\r\nblah',
    expected: [
      { type: 'newline', value: '\n' },
      { type: 'openTag', key: 'standalone' },
      { type: 'closeTag', key: 'standalone' },
      { type: 'text', value: 'blah' },
    ]
  },

  'Standalone lines with \\r\\n endings': {
    template: '\r\n  {{#standalone}}\r\n   {{/standalone}}\r\nblah',
    expected: [
      { type: 'newline', value: '\r\n' },
      { type: 'openTag', key: 'standalone' },
      { type: 'closeTag', key: 'standalone' },
      { type: 'text', value: 'blah' },
    ]
  },

  'Standalone without previous line': {
    template: '  {{#standalone}}\n#{{/standalone}}\n/',
    expected: [
      { type: 'openTag', key: 'standalone' },
      { type: 'text', value: '#' },
      { type: 'closeTag', key: 'standalone' },
      { type: 'newline', value: '\n' },
      { type: 'text', value: '/' }
    ]
  },

  'Standalone without next line': {
    template: '#{{#standalone}}\n/\n  {{/standalone}}',
    expected: [
      { type: 'text', value: '#' },
      { type: 'openTag', key: 'standalone' },
      { type: 'newline', value: '\n' },
      { type: 'text', value: '/' },
      { type: 'newline', value: '\n' },
      { type: 'closeTag', key: 'standalone' },
    ]
  },

  'Do NOT strip single-line sections': {
    template: ' {{#oneline}}YES{{/oneline}}\n {{#oneline}}GOOD{{/oneline}}\n',
    expected: [
      { type: 'text', value: ' ' },
      { type: 'openTag', key: 'oneline' },
      { type: 'text', value: 'YES' },
      { type: 'closeTag', key: 'oneline' },
      { type: 'newline', value: '\n' },
      { type: 'text', value: ' ' },
      { type: 'openTag', key: 'oneline' },
      { type: 'text', value: 'GOOD' },
      { type: 'closeTag', key: 'oneline' },
      { type: 'newline', value: '\n' }
    ]
  },

  'Preserve leading indentation for partials': {
    template: '  {{>partial}}\n>',
    expected: [
      { type: 'partialTag', key: 'partial', indent: '  ' },
      { type: 'newline', value: '\n' },
      { type: 'text', value: '>' }
    ]
  },
}


// the dirt-simple spec runner
for (var name in specs) {
  runSpec(name, specs[name]);
}


// Print stats
pass = (stats.pass + ' passed').green;
fail = (stats.fail + ' failed').red;
err = (stats.error + ' errors').yellow;
console.log();
console.log(pass + ', ' + fail + ', ' + err);
