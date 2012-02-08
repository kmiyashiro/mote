var string = createBenchmark('String', {
  mustache: "Hello World!",
  handlebars: "Hello World!",
  dust: "Hello World!"
});

var replace = createBenchmark('Replace', {
	mustache: "Hello {{name}}! You have {{count}} new messages.",
	handlebars: "Hello {{name}}! You have {{count}} new messages.",
	dust: "Hello {name}! You have {count} new messages."
}, {
	name: "Mick",
	count: 30
});

var array = createBenchmark('Array', {
	mustache: "{{#names}}{{name}}{{/names}}",
	handlebars: "{{#each names}}{{name}}{{/each}}",
	dust: "{#names}{name}{/names}"
}, {
	names: [
		{name: "Moe"},
		{name: "Larry"},
		{name: "Curly"},
		{name: "Shemp"}
	]
});

var object = createBenchmark('Object', {
	mustache: "{{#person}}{{name}}{{age}}{{/person}}",
	handlebars: "{{#with person}}{{name}}{{age}}{{/with}}",
	dust: "{#person}{name}{age}{/person}"
}, {
	person: {
		name: "Larry",
		age: 45
	}
});

var partial = createBenchmark('Partial', {
	mustache: "{{#peeps}}{{>partial}}{{/peeps}}",
	handlebars: "{{#each peeps}}{{>partial}}{{/each}}",
	dust: "{#peeps}{>partial/}{/peeps}"
}, {
	peeps: [
		{name: "Moe", count: 15},
		{name: "Larry", count: 5},
		{name: "Curly", count: 1},
	]
}, {
	mustache: {partial: "Hello {{name}}! You have {{count}} new messages."},
	handlebars: {partial: "Hello {{name}}! You have {{count}} new messages."},
	dust: {partial: "Hello {name}! You have {count} new messages."},
});

var recursion = createBenchmark('Recursion', {
	mustache: "{{name}}{{#kids}}{{>recursion}}{{/kids}}",
	handlebars: "{{name}}{{#each kids}}{{>recursion}}{{/each}}",
	dust: "{name}{#kids}{>Recursion:./}{/kids}",
}, {
	name: '1 ',
	kids: [{
		name: '1.1 ',
		kids: [{
			name: '1.1.1 ',
			kids: []
		}]
	}]
}, {
	mustache: { recursion: "{{name}}{{#kids}}{{>recursion}}{{/kids}}" },
	handlebars: { recursion: "{{name}}{{#each kids}}{{>recursion}}{{/each}}" },
});

var complex = createBenchmark('Complex', {
	mustache: "<h1>{{header}}</h1>{{#hasItems}}<ul>{{#items}}{{#current}}<li><strong>{{name}}</strong></li>{{/current}}{{^current}}<li><a href=\"{{url}}\">{{name}}</a></li>{{/current}}{{/items}}</ul>{{/hasItems}}{{^items}}<p>The list is empty.</p{{/items}}",
	mote: "<h1>{{header}}</h1>{{?items}}<ul>{{#items}}{{#current}}<li><strong>{{name}}</strong></li>{{/current}}{{^current}}<li><a href=\"{{url}}\">{{name}}</a></li>{{/current}}{{/items}}</ul>{{/items}}{{^items}}<p>The list is empty.</p{{/items}}",
	handlebars: "<h1>{{header}}</h1>{{#if items}}<ul>{{#each items}}{{#if current}}<li><strong>{{name}}</strong></li>{{else}}<li><a href=\"{{url}}\">{{name}}</a></li>{{/if}}{{/each}}</ul>{{else}}<p>The list is empty.</p>{{/if}}",
	dust: "<h1>{header}</h1>\n"
		+  "{?items}\n"
		+  "  <ul>\n"
		+  "    {#items}\n"
		+  "      {#current}\n"
		+  "        <li><strong>{name}</strong></li>\n"
		+  "      {:else}\n"
		+  "        <li><a href=\"{url}\">{name}</a></li>\n"
		+  "      {/current}\n"
		+  "    {/items}\n"
		+  "  </ul>\n"
		+  "{:else}\n"
		+  "  <p>The list is empty.</p>\n"
		+  "{/items}"
}, {
	header: function() { return "Colors"; },
	hasItems: true,
	items: [
		{name: "red", current: true, url: "#Red"},
		{name: "green", current: false, url: "#Green"},
		{name: "blue", current: false, url: "#Blue"}
	]
})

function createBenchmark(benchmarkName, templates, context, partials) {
  partials = partials || {};

  /* Compile the partials */
  var name = benchmarkName.toLowerCase();
  if (partials.mustache) mote.compilePartial(name, partials.mustache[name]);
  if (partials.handlebars) Handlebars.registerPartial(name, partials.handlebars[name]);
  if (partials.dust) dust.loadSource(dust.compile(partials.dust[name], name));

  /* Compile the templates */
  var muFn = Mustache.compile(templates.mustache);
  var hoTe = Hogan.compile(templates.mustache);
  var moFn = templates.mote ? mote.compile(templates.mote) : mote.compile(templates.mustache);
  var hbFn = Handlebars.compile(templates.handlebars);
  dust.loadSource(dust.compile(templates.dust, benchmarkName));

  function noop(){};

  console.log('=== ' + benchmarkName + ' ===');
  console.log('mustache  :', muFn(context, partials.mustache));
  console.log('hogan     :', hoTe.render(context, partials.mustache));
  console.log('mote      :', moFn(context));
  console.log('handlebars:', hbFn(context));
  dust.render(benchmarkName, context, function(err, out) {
    console.log('dust      :', out);
  });
  console.log('');

  var suite = new Benchmark.Suite(benchmarkName);
  Benchmark.options.maxTime = 1;
  Benchmark.options.delay = 0.1;

  suite
    .add('mustache', function() { muFn(context, partials.mustache); })
    .add('hogan', function() { hoTe.render(context, partials.mustache); })
    .add('mote', function() { moFn(context); })
    .add('handlebars', function() { hbFn(context); })
    .add('dust', function() { dust.render(benchmarkName, context, noop); })

  return suite;
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

function interpolate(v0, v1, ratio) {
  var out = [];
  for (var i = 0; i < v0.length; i++) {
    out.push(v0[i] + ratio*(v1[i]-v0[i]));
  }
  return out;
}

var hsvMin = rgbToHsv(255, 128, 128);
var hsvMax = rgbToHsv(128, 255, 128);

function Result(name, value, max) {
  this.name = name;
  this.value = value;
  this.max = max;
  this.el = $('<div class="result"></div>');
}

Result.prototype.render = function() {
  this.el.html(this.template(this));
  this.bar = this.el.find('.bar');
  return this;
};

Result.prototype.reset = function() {
  this.update(0, 0, 0);
};

Result.prototype.opsSec = function() {
  return Math.floor(this.value/1000);
};

Result.prototype.formatColor = function(ratio) {
  var hsv = interpolate(hsvMin, hsvMax, ratio);
  var rgb = hsvToRgb.apply(null, hsv);
  rgb[0] = Math.floor(rgb[0]);
  rgb[1] = Math.floor(rgb[1]);
  rgb[2] = Math.floor(rgb[2]);
  return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
};

Result.prototype.update = function(min, max, value) {
  var ratio;
  this.value = value != null ? value : this.value;
  this.max = max != null ? max : this.max;
  this.min = min != null ? min : this.min;
  this.render();
  ratio = this.value / this.max;
  colorRatio = (this.value - this.min) / (this.max - this.min);
  this.bar.css({
    width: 400 * ratio,
    backgroundColor: this.formatColor(colorRatio)
  });
  return this;
};

function Suite(suite){
  this.results = {
    mustache: new Result('mustache'),
    hogan: new Result('hogan'),
    mote: new Result('mote'),
    handlebars: new Result('handlebars'),
    dust: new Result('dust'),
  };
  this.name = suite.name;
  this.suite = suite;
  this.running = false;
}

Suite.prototype.render = function() {
  var self = this;

  this.el = this.el || $(this.template(this));

  for (var name in this.results) {
    this.el.append(this.results[name].render().el);
  }

  this.el.find('button').on('click', function(event) {
    event.preventDefault();

    $(event.target).attr('disabled', 'disabled');
    self.run();
  });

  return this;
};

Suite.prototype.resetResults = function() {
  var result;
  for (var name in this.results) {
    this.results[name].reset();
  }
};

Suite.prototype.run = function() {
  var max = 0, min = Infinity, self = this;

  this.resetResults();
  this.suite.reset();

  this.suite.on('cycle', function(event, bench) {
    max = bench.hz > max ? bench.hz : max;
    min = bench.hz < min ? bench.hz : min;
    var result = self.results[bench.name];
    result.update(min, max, bench.hz)
    for (var name in self.results) {
      self.results[name].update(min, max);
    }
  });

  this.suite.on('complete', function() {
    self.el.find('button').attr('disabled', false);
  });

  this.suite.run({async: true});
};

