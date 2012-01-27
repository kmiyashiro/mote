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
var delimiters = fs.readFileSync(__dirname + '/spec/specs/delimiters.json', 'utf8');

interpolation = JSON.parse(interpolation).tests;
comments = JSON.parse(comments).tests;
sections = JSON.parse(sections).tests;
inverted = JSON.parse(inverted).tests;
partials = JSON.parse(partials).tests;
delimiters = JSON.parse(delimiters).tests;


mustache.render = mustache.to_html;

function bench(name, engine) {
  var start = Date.now();
  var times = 10000;
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
    for (i = 0, len = partials.length; i < len; i++) {
      engine.render(partials[i].template, partials[i].data, partials[i].partials);
    }
  }
  console.log('%s completed in %dms.', name, Date.now() - start);
}

//bench('mustache5', mustache5);
//bench('pistachio', pistachio);


var complexMu =
'<h1>{{header}}</h1>\n' +
'{{#list}}' +
  '<ul>' +
  '{{#item}}' +
    '{{#current}}' +
      '<li><strong>{{name}}</strong></li>' +
    '{{/current}}' +
    '{{#link}}' +
      '<li><a href="{{url}}">{{name}}</a></li>' +
    '{{/link}}' +
  '{{/item}}' +
  '</ul>' +
'{{/list}}' +
'{{#empty}}' +
  '<p>The list is empty.</p>' +
'{{/empty}}';

var complex = {
  header: function() {
    return "Colors";
  },
  item: [
      {name: "red", current: true, url: "#Red"},
      {name: "green", current: false, url: "#Green"},
      {name: "blue", current: false, url: "#Blue"}
  ],
  link: function() {
    return this["current"] !== true;
  },
  list: function() {
    return this.item.length !== 0;
  },
  empty: function() {
    return this.item.length === 0;
  }
}

var tmpl = pistachio.template(complexMu);
var start = Date.now()
for (i = 0; i < 100000; i++) {
  pistachio.render(complexMu, complex);
}
console.log('pistachio completed in %dms.', Date.now() - start);

var tmpl = hb.compile(complexMu);
var start = Date.now()
for (i = 0; i < 100000; i++) {
  tmpl(complex);
}
console.log('hb completed in %dms.', Date.now() - start);

