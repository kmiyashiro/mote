var pistachio = require('../pistachio.js');
var colors = require('colors');
var fs = require('fs');

var spec = process.argv[2];

var specs = fs.readFileSync(__dirname + '/specs/' + spec + '.json', 'utf8');
specs = JSON.parse(specs).tests;

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

function runSpec(spec) {
  var error, actual, lambda, source
    , title = spec.name + ': ' + spec.desc
    , status;

  if (source = spec.data.lambda) {
    eval('lambda = ' + source.js);
    spec.data.lambda = lambda;
  }

  try {
    actual = pistachio.render(spec.template, spec.data, spec.partials);
  } catch(err) {
    error = err;
  }

  if (error) {
    line('[ERROR] ' + title, 0, 'red');
    error.stack.split(/\n/).forEach(function(errorLine) {
      line(errorLine, 1);
    });
    stats.error += 1;
    status = 'error';
  } else if (actual !== spec.expected) {
    line('[FAIL] ' + title, 0, 'red');
    line('expect: '.yellow + JSON.stringify(spec.expected), 2);
    line('actual: '.yellow + JSON.stringify(actual), 2);
    stats.fail += 1;
    status = 'fail';
  } else {
    line('[PASS] ' + title, 0, 'green');
    stats.pass += 1;
    status = 'pass';
  }
  return status;
}

// Run the tests
var status;
for (var i = 0; i < specs.length; i++) {
  status = runSpec(specs[i]);
  //if (!(status === 'pass')) break;
}

pass = (stats.pass + ' passed').green;
fail = (stats.fail + ' failed').red;
err = (stats.error + ' errors').yellow;
console.log();
console.log(pass + ', ' + fail + ', ' + err);
