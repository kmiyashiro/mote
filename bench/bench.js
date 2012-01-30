var Benchmark = require('benchmark')
  , colors = require('colors')
  , hb = require('./handlebars')
  , mustache = require('./mustache')
  , mote = require('../mote')
  , hogan = require('./hogan');

  var tests = {

    string: {
      template: "Hello World!",
      context: {}
    },

    replace: {
      template:  "Hello {{name}}! You have {{count}} new messages.",
      context: { name: "Mick", count: 30 }
    },

    array: {
      template: "{{#names}}{{name}}{{/names}}",
      context: {
        names: [
          {name: "Moe"},
          {name: "Larry"},
          {name: "Curly"},
          {name: "Shemp"}
        ]
      }
    },

    object: {
      template: "{{#person}}{{name}}{{age}}{{/person}}",
      context: {
        person: {
          name: "Larry",
          age: 45
        }
      }
    },

    partial: {
      template: "{{#peeps}}{{>replace}}{{/peeps}}",
      context:  {
        peeps: [
          {name: "Moe", count: 15},
          {name: "Larry", count: 5},
          {name: "Curly", count: 1}
        ]
      },
      partials: { replace: "Hello {{name}}! You have {{count}} new messages." }
    },

    recursion: {
      template: "{{name}}{{#kids}}{{>recursion}}{{/kids}}",
      context:  {
        name: '1',
        kids: [
          {
          name: '1.1',
          kids: [
            {name: '1.1.1', kids: []}
          ]
        }
        ]
      },
      partials: { recursion: "{{name}}{{#kids}}{{>recursion}}{{/kids}}" }
    },

    filter: {
      template: "{{#filter}}foo {{bar}}{{/filter}}",
      context:  {
        filter: function(buffer, context, fn) {
          return fn(buffer, context).toUpperCase();
        },
        bar: "bar"
      },
      helper: [
        'filter',
        function(options) {
          return options.fn(this).toUpperCase()
        }
      ],
      muContext: {
        filter: function(txt) {
          return txt.toUpperCase();
        },
        bar: 'bar'
      }
    },

    complex: {
      template:
        "<h1>{{header}}</h1>"                       +
        "{{#items}}"                                +
        "<ul>"                                      +
        "{{#current}}"                              +
        "<li><strong>{{name}}</strong></li>"        +
        "{{/current}}"                              +
        "{{^current}}"                              +
        "<li><a href=\"{{url}}\">{{name}}</a></li>" +
        "{{/current}}"                              +
        "</ul>"                                     +
        "{{/items}}"                                +
        "{{^items}}"                                +
        "<p>The list is empty.</p>"                 +
        "{{/items}}",
      context: {
        header: function() {
          return "Colors";
        },
        items: [
          {name: "red", current: true, url: "#Red"},
          {name: "green", current: false, url: "#Green"},
          {name: "blue", current: false, url: "#Blue"}
        ]
      }
    }
  }

function bench(name, test) {
  var p, partial, suite, hbFn, moteFn, muFn, hoganFn, muContext;

  hb.partials = {};
  mote.clearCache();
  mustache.clearCache();

  if (test.partials) {
    for (var p in test.partials) {
      partial = test.partials[p];
      mustache.compile(partial);
      mote.compilePartial(p, partial);
      hb.registerPartial(p, partial);
    }
  }

  if (test.helper) {
    hb.registerHelper(test.helper[0], test.helper[1]);
  }

  suite = new Benchmark.Suite(name)

  hbFn = hb.compile(test.template)
  moteFn = mote.compile(test.template)
  muFn = mustache.compile(test.template);
  hoganFn = hogan.compile(test.template);

  muContext = (name === 'Filter') ? test.context.muContext : test.context;

  console.log(name.white);
  console.log(hoganFn.render(muContext, test.partials).yellow);
  console.log(muFn(muContext, test.partials).yellow);
  console.log(hbFn(test.context).yellow);
  console.log(moteFn(test.context).yellow);

  console.log(hoganFn.r.toString());

  suite
    .add('hogan', function() {
      hoganFn.render(muContext, test.partials);
    })
    .add('mustache', function() {
      muFn(muContext, test.partials);
    })
    .add('handlebars', function() {
      hbFn(test.context);
    })
    .add('mote', function() {
      moteFn(test.context);
    })
    .on('cycle', function(event, bench) {
      console.log(bench.toString());
    })
    .on('complete', function() {
      console.log(('Fastest: ' + this.filter('fastest').pluck('name')).green);
    })
    .run();
}

bench('String', tests.string);
bench('Replace', tests.replace);
bench('Array', tests.array);
bench('Object', tests.object);
bench('Partial', tests.partial);
bench('Recursion', tests.recursion);
bench('Filter', tests.filter);
bench('Complex', tests.complex);

