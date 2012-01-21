// Require pistachio
var pistachio = require('../../pistachio.js');
var colors = require('colors');

// The specs, JSONified
var tests = [
  {
    "name": "Interpolation",
    "desc": "A lambda's return value should be interpolated.",
    "data": {
      "lambda": {
        "ruby": "proc { \"world\" }",
        "perl": "sub { \"world\" }",
        "js": "function() { return \"world\" }",
        "php": "return \"world\";",
        "python": "lambda: \"world\"",
        "clojure": "(fn [] \"world\")",
        "__tag__": "code"
      }
    },
    "template": "Hello, {{lambda}}!",
    "expected": "Hello, world!"
  },
  {
    "name": "Interpolation - Expansion",
    "desc": "A lambda's return value should be parsed.",
    "data": {
      "planet": "world",
      "lambda": {
        "ruby": "proc { \"{{planet}}\" }",
        "perl": "sub { \"{{planet}}\" }",
        "js": "function() { return \"{{planet}}\" }",
        "php": "return \"{{planet}}\";",
        "python": "lambda: \"{{planet}}\"",
        "clojure": "(fn [] \"{{planet}}\")",
        "__tag__": "code"
      }
    },
    "template": "Hello, {{lambda}}!",
    "expected": "Hello, world!"
  },
  {
    "name": "Interpolation - Alternate Delimiters",
    "desc": "A lambda's return value should parse with the default delimiters.",
    "data": {
      "planet": "world",
      "lambda": {
        "ruby": "proc { \"|planet| => {{planet}}\" }",
        "perl": "sub { \"|planet| => {{planet}}\" }",
        "js": "function() { return \"|planet| => {{planet}}\" }",
        "php": "return \"|planet| => {{planet}}\";",
        "python": "lambda: \"|planet| => {{planet}}\"",
        "clojure": "(fn [] \"|planet| => {{planet}}\")",
        "__tag__": "code"
      }
    },
    "template": "{{= | | =}}\nHello, (|&lambda|)!",
    "expected": "Hello, (|planet| => world)!"
  },
  {
    "name": "Interpolation - Multiple Calls",
    "desc": "Interpolated lambdas should not be cached.",
    "data": {
      "lambda": {
        "ruby": "proc { $calls ||= 0; $calls += 1 }",
        "perl": "sub { no strict; $calls += 1 }",
        "js": "function() { return (g=(function(){return this})()).calls=(g.calls||0)+1 }",
        "php": "global $calls; return ++$calls;",
        "python": "lambda: globals().update(calls=globals().get(\"calls\",0)+1) or calls",
        "clojure": "(def g (atom 0)) (fn [] (swap! g inc))",
        "__tag__": "code"
      }
    },
    "template": "{{lambda}} == {{{lambda}}} == {{lambda}}",
    "expected": "1 == 2 == 3"
  },
  {
    "name": "Escaping",
    "desc": "Lambda results should be appropriately escaped.",
    "data": {
      "lambda": {
        "ruby": "proc { \">\" }",
        "perl": "sub { \">\" }",
        "js": "function() { return \">\" }",
        "php": "return \">\";",
        "python": "lambda: \">\"",
        "clojure": "(fn [] \">\")",
        "__tag__": "code"
      }
    },
    "template": "<{{lambda}}{{{lambda}}}",
    "expected": "<&gt;>"
  },
  {
    "name": "Section",
    "desc": "Lambdas used for sections should receive the raw section string.",
    "data": {
      "x": "Error!",
      "lambda": {
        "ruby": "proc { |text| text == \"{{x}}\" ? \"yes\" : \"no\" }",
        "perl": "sub { $_[0] eq \"{{x}}\" ? \"yes\" : \"no\" }",
        "js": "function(txt) { return (txt == \"{{x}}\" ? \"yes\" : \"no\") }",
        "php": "return ($text == \"{{x}}\") ? \"yes\" : \"no\";",
        "python": "lambda text: text == \"{{x}}\" and \"yes\" or \"no\"",
        "clojure": "(fn [text] (if (= text \"{{x}}\") \"yes\" \"no\"))",
        "__tag__": "code"
      }
    },
    "template": "<{{#lambda}}{{x}}{{/lambda}}>",
    "expected": "<yes>"
  },
  {
    "name": "Section - Expansion",
    "desc": "Lambdas used for sections should have their results parsed.",
    "data": {
      "planet": "Earth",
      "lambda": {
        "ruby": "proc { |text| \"#{text}{{planet}}#{text}\" }",
        "perl": "sub { $_[0] . \"{{planet}}\" . $_[0] }",
        "js": "function(txt) { return txt + \"{{planet}}\" + txt }",
        "php": "return $text . \"{{planet}}\" . $text;",
        "python": "lambda text: \"%s{{planet}}%s\" % (text, text)",
        "clojure": "(fn [text] (str text \"{{planet}}\" text))",
        "__tag__": "code"
      }
    },
    "template": "<{{#lambda}}-{{/lambda}}>",
    "expected": "<-Earth->"
  },
  {
    "name": "Section - Alternate Delimiters",
    "desc": "Lambdas used for sections should parse with the current delimiters.",
    "data": {
      "planet": "Earth",
      "lambda": {
        "ruby": "proc { |text| \"#{text}{{planet}} => |planet|#{text}\" }",
        "perl": "sub { $_[0] . \"{{planet}} => |planet|\" . $_[0] }",
        "js": "function(txt) { return txt + \"{{planet}} => |planet|\" + txt }",
        "php": "return $text . \"{{planet}} => |planet|\" . $text;",
        "python": "lambda text: \"%s{{planet}} => |planet|%s\" % (text, text)",
        "clojure": "(fn [text] (str text \"{{planet}} => |planet|\" text))",
        "__tag__": "code"
      }
    },
    "template": "{{= | | =}}<|#lambda|-|/lambda|>",
    "expected": "<-{{planet}} => Earth->"
  },
  {
    "name": "Section - Multiple Calls",
    "desc": "Lambdas used for sections should not be cached.",
    "data": {
      "lambda": {
        "ruby": "proc { |text| \"__#{text}__\" }",
        "perl": "sub { \"__\" . $_[0] . \"__\" }",
        "js": "function(txt) { return \"__\" + txt + \"__\" }",
        "php": "return \"__\" . $text . \"__\";",
        "python": "lambda text: \"__%s__\" % (text)",
        "clojure": "(fn [text] (str \"__\" text \"__\"))",
        "__tag__": "code"
      }
    },
    "template": "{{#lambda}}FILE{{/lambda}} != {{#lambda}}LINE{{/lambda}}",
    "expected": "__FILE__ != __LINE__"
  },
  {
    "name": "Inverted Section",
    "desc": "Lambdas used for inverted sections should be considered truthy.",
    "data": {
      "static": "static",
      "lambda": {
        "ruby": "proc { |text| false }",
        "perl": "sub { 0 }",
        "js": "function(txt) { return false }",
        "php": "return false;",
        "python": "lambda text: 0",
        "clojure": "(fn [text] false)",
        "__tag__": "code"
      }
    },
    "template": "<{{^lambda}}{{static}}{{/lambda}}>",
    "expected": "<>"
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
