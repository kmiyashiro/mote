// Require pistachio
var pistachio = require('../../pistachio.js');
var colors = require('colors');

// The specs, JSONified
var tests = [
  {
    "name": "Inline",
    "desc": "Comment blocks should be removed from the template.",
    "data": {
    },
    "template": "12345{{! Comment Block! }}67890",
    "expected": "1234567890"
  },
  {
    "name": "Multiline",
    "desc": "Multiline comments should be permitted.",
    "data": {
    },
    "template": "12345{{!\n  This is a\n  multi-line comment...\n}}67890\n",
    "expected": "1234567890\n"
  },
  {
    "name": "Standalone",
    "desc": "All standalone comment lines should be removed.",
    "data": {
    },
    "template": "Begin.\n{{! Comment Block! }}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Indented Standalone",
    "desc": "All standalone comment lines should be removed.",
    "data": {
    },
    "template": "Begin.\n  {{! Indented Comment Block! }}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Standalone Line Endings",
    "desc": "\"\\r\\n\" should be considered a newline for standalone tags.",
    "data": {
    },
    "template": "|\r\n{{! Standalone Comment }}\r\n|",
    "expected": "|\r\n|"
  },
  {
    "name": "Standalone Without Previous Line",
    "desc": "Standalone tags should not require a newline to precede them.",
    "data": {
    },
    "template": "  {{! I'm Still Standalone }}\n!",
    "expected": "!"
  },
  {
    "name": "Standalone Without Newline",
    "desc": "Standalone tags should not require a newline to follow them.",
    "data": {
    },
    "template": "!\n  {{! I'm Still Standalone }}",
    "expected": "!\n"
  },
  {
    "name": "Multiline Standalone",
    "desc": "All standalone comment lines should be removed.",
    "data": {
    },
    "template": "Begin.\n{{!\nSomething's going on here...\n}}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Indented Multiline Standalone",
    "desc": "All standalone comment lines should be removed.",
    "data": {
    },
    "template": "Begin.\n  {{!\n    Something's going on here...\n  }}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Indented Inline",
    "desc": "Inline comments should not strip whitespace",
    "data": {
    },
    "template": "  12 {{! 34 }}\n",
    "expected": "  12 \n"
  },
  {
    "name": "Surrounding Whitespace",
    "desc": "Comment removal should preserve surrounding whitespace.",
    "data": {
    },
    "template": "12345 {{! Comment Block! }} 67890",
    "expected": "12345  67890"
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
