var fs = require('fs');
var mustache = require('mustache');
var mustache5 = require('./mustache5');
var pistachio = require('./pistachio');
var hb = require('handlebars');

var interpolation = fs.readFileSync(__dirname + '/spec/specs/interpolation.json', 'utf8');
var comments = fs.readFileSync(__dirname + '/spec/specs/comments.json', 'utf8');
var sections = fs.readFileSync(__dirname + '/spec/specs/sections.json', 'utf8');
var inverted = fs.readFileSync(__dirname + '/spec/specs/inverted.json', 'utf8');
var partials = fs.readFileSync(__dirname + '/spec/specs/partials.json', 'utf8');

interpolation = JSON.parse(interpolation).tests;
comments = JSON.parse(comments).tests;
sections = JSON.parse(sections).tests;
inverted = JSON.parse(inverted).tests;
partials = JSON.parse(partials).tests;

mustache.render = mustache.to_html;

function bench(name, engine) {
  var start = Date.now();
  var times = 1000;
  var len;
  var i;

  while (times--) {
    for (i = 0, len = interpolation.length; i < len; i++) {
      engine.render(interpolation[i].template, interpolation[i].data);
    }
    for (i = 0, len = comments.length; i < len; i++) {
      engine.render(comments[i].template, comments[i].data);
    }
    for (i = 0, len = sections.length; i < len; i++) {
      engine.render(sections[i].template, sections[i].data);
    }
    for (i = 0, len = inverted.length; i < len; i++) {
      engine.render(inverted[i].template, inverted[i].data);
    }
  }
  console.log('%s completed in %dms.', name, Date.now() - start);
}

bench('mustache', mustache);
bench('mustache5', mustache5);
bench('pistachio', pistachio);
