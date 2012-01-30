var hb = require('handlebars');
var mustache = require('./mustache')
var mote = require('./mote');
var data, template;

function bench(name, engine, template, data) {
  var start = Date.now();
  var fn = engine.compile(template);
  var times = 1000000;

  for (var i = 0; i < times; i++) {
    fn(data);
  }

  console.log(fn(data));

  console.log(name + ' completed in ' + (Date.now() - start) + 'ms');
}

//template = "{{name}}{{#kids}}{{>recursion}}{{/kids}}";
//data = {
  //name: '1',
  //kids: [
    //{
    //name: '1.1',
    //kids: [
      //{name: '1.1.1', kids: []}
    //]
  //}
  //]
//};
//partials = { recursion: "{{name}}{{#kids}}{{>recursion}}{{/kids}}" }

//mote.compilePartial('recursion', partials.recursion);
//console.log(mote.loadTemplate('recursion').toString());
//console.log(mote.render(template, data));

//template = "abcdefg\n{{#hasItems}}<ul>{{#items}}{{#current}}" +
             //"<li><strong>{{name}}</strong></li>{{/current}}{{^current}}" +
             //"<li><a href=\"{{url}}\">{{name}}</a></li>{{/current}}"      +
             //"{{/items}}</ul>{{/hasItems}}{{^hasItems}}<p>The list is empty.</p>{{/hasItems}}";
//data = {
  //header: function() {
    //return "Colors";
  //},
  //items: [
    //{name: "red", current: true, url: "#Red"},
    //{name: "green", current: false, url: "#Green"},
    //{name: "blue", current: false, url: "#Blue"}
  //],
  //hasItems: function(buffer, fn) {
    //if (this.items.length !== 0) return fn(buffer).flush();
  //},
  //empty: function() {
    //return this.items.length === 0;
  //}
//}

//template = "<h1>{{header}}</h1>{{#hasItems}}{{/hasItems}}";
//console.log(mote.compile(template)(data));

template = "Hello there!";
data = {};
bench('simple:mote', mote, template, data);
bench('simple:mustache', mustache, template, data);
bench('simple:handlebars', hb, template, data);
console.log()

template = "Howdy {{pardner}}!";
data = {pardner: 'arthur dent'};
bench('replace:mote', mote, template, data);
bench('replace:mustache', mustache, template, data);
bench('replace:handlebars', hb, template, data);
console.log()

template = "{{#a}}{{b}}{{/a}}";
data = {a: {b: 'render me'}};
bench('section:mote', mote, template, data);
bench('section:mustache', mustache, template, data);
bench('section:handlebars', hb, template, data);
console.log()

template = "{{#a}}<{{.}}>{{/a}}";
data = {a: [1, 2, 3, 4, 5]};
bench('array:mote', mote, template, data);
bench('array:mustache', mustache, template, data);
bench('array:handlebars', hb, template, data);
console.log()

template = "{{#names}}{{name}}{{/names}}";
data = { names: [{name: "Moe"}, {name: "Larry"}, {name: "Curly"}, {name: "Shemp"}] };
bench('object:mote', mote, template, data);
bench('object:mustache', mustache, template, data);
bench('object:handlebars', hb, template, data);
console.log()


//template = "<h1>{{header}}</h1>{{#hasItems}}<ul>{{#items}}{{#current}}" +
             //"<li><strong>{{name}}</strong></li>{{/current}}{{^current}}" +
             //"<li><a href=\"{{url}}\">{{name}}</a></li>{{/current}}"      +
             //"{{/items}}</ul>{{/hasItems}}{{^hasItems}}<p>The list is empty.</p>{{/hasItems}}";

//data ={
  //header: function() {
    //return "Colors";
  //},
  //items: [
    //{name: "red", current: true, url: "#Red"},
    //{name: "green", current: false, url: "#Green"},
    //{name: "blue", current: false, url: "#Blue"}
  //],
  //hasItems: function() {
    //return this.items.length !== 0;
  //},
  //empty: function() {
    //return this.items.length === 0;
  //}
//}
//bench('object:mote', mote, template, data);
//bench('object:mustache', mustache, template, data);
//bench('object:handlebars', hb, template, data);
//console.log()

//hb.compile = function(string, options) {
  //options = options || {};

  //var compiled;
  //function compile() {
    //var ast = hb.parse(string);
    //var environment = new hb.Compiler().compile(ast, options);
    //var templateSpec = new hb.JavaScriptCompiler().compile(environment, options, undefined, true);
    //console.log(templateSpec.toString());
    //return hb.template(templateSpec);
  //}

  //compile();

  //// Template is only compiled on first use and cached after that point.
  //return function(context, options) {
    //if (!compiled) {
      //compiled = compile();
    //}
    //return compiled.call(this, context, options);
  //};
//};

//hb.compile(template);
//mote.compile(template);
