var mote = ((typeof module !== 'undefined') && module.exports) || {};

(function(exports) {

/**
 * Utilities
 */

var isArray = Array.isArray || function(obj) {
  return Object.prototype.toString.call(obj) == '[object Array]';
};

// Credit to Simon Willison and Colin Snover:
// http://simonwillison.net/2006/Jan/20/escape/
function RE(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function e(str) {
  return JSON.stringify(str);
}

/**
 * Scanner
 */

function Scanner(str) {
  this.raw = str;
  this.str = str;
  this.pos = 0;
}

Scanner.prototype.eos = function() {
  return !this.str;
};

Scanner.prototype.startOfLine = function() {
  return (!this.pos || (this.raw.charAt(this.pos-1) === '\n'));
};

Scanner.prototype.scan = function(re) {
  var match = this.str.match(re);
  if (!match || (match.index > 0)) return null;
  this.str = this.str.substring(match[0].length);
  this.pos += match[0].length;
  return match[0];
};

Scanner.prototype.scanUntil = function(re) {
  var match
    , pos = this.str.search(re);

  switch (pos) {
    case -1:
      match = this.str;
      this.pos += this.str.length;
      this.str = '';
      break;
    case 0:
      match = null;
      break;
    default:
      match = this.str.substring(0, pos);
      this.str = this.str.substring(pos);
      this.pos += pos;
  }
  return match;
};

/**
 * Parser
 */

function parse(template) {
  var p = new Parser();
  return p.parse(template);
}

function Parser() {
  this.tokens = [];
  this.tokenCollector = this.tokens;
  this.sections = [];
  this.otag = '{{';
  this.ctag = '}}';
  this.compileRegexen();
}

Parser.prototype.compileRegexen = function() {
  this.re.opentag = new RegExp('(?:([ \\t]*))?' + RE(this.otag));
  this.re.closetag = new RegExp('[\\}!=]?' + RE(this.ctag));
};

Parser.prototype.re = {
  newline: /\r?\n/,
  whitespace: /[ \t]*/,
  trailing: /[ \t]*(?:\r?\n|$)/,
  tagtype: /\{|&|#|\^|\/|>|=|!|\?/,
  allowed: /[\w\$\.]+/,
  lines: /(.*)(\r?\n)?/g
};

Parser.prototype.standalone = function(type) {
  return type && type !== '{' && type !== '&';
};

Parser.prototype.parse = function(str, options) {
  options = options || {};

  if (options.otag && options.ctag) {
    this.otag = options.otag;
    this.ctag = options.ctag;
    this.compileRegexen();
  }

  this.addLineStart();
  this.scanner = new Scanner(str);
  while (!this.scanner.eos()) this.scanTags();
  return this.clean(this.tokens);
};

Parser.prototype.clean = function(tokens) {
  if ((tokens.length > 1) && (tokens[1].type === 'sol')) tokens.shift();
  return tokens;
};

Parser.prototype.scanTags = function() {
  var otag, padding, type, content, startOfLine
    , standAlone = false;

  this.scanText();

  startOfLine = this.scanner.startOfLine();
  if (startOfLine && !this.scanner.eos()) this.addLineStart();

  // Match the opening tag.
  if (!(otag = this.scanner.scan(this.re.opentag))) return;

  // Handle leading whitespace
  padding = this.re.whitespace.exec(otag);
  padding = padding && padding[0];

  // Get the tag's type.
  type = this.scanner.scan(this.re.tagtype);
  type = type && type[0];

  // Skip whitespace.
  this.scanner.scan(this.re.whitespace);

  // Get the tag's inner content.
  if (type === '!' || type === '=') {
    content = this.scanner.scanUntil(this.re.closetag);
  } else {
    content = this.scanner.scan(this.re.allowed);
    if (content.indexOf('.') > 0) content = e(content.split('.'));
    else content = e(content);
  }

  // Skip whitespace again.
  this.scanner.scan(this.re.whitespace);

  // Closing tag.
  if (!this.scanner.scan(this.re.closetag)) {
    throw new Error('Unclosed tag');
  }

  // Strip leading and trailing whitespace if necessary.
  if (startOfLine && this.standalone(type) &&
      (this.scanner.scan(this.re.trailing) !== null)) {
      standAlone = true;
  }

  if (!standAlone) {
    this.addText(padding);
    padding = '';
  }

  this.addTag(type, content, padding);
};

Parser.prototype.scanText = function(str) {
  var text = this.scanner.scanUntil(this.re.opentag);
  this.addText(text);
};

Parser.prototype.addLineStart = function() {
  this.tokenCollector.push({type: 'sol'});
};

Parser.prototype.addText = function(text) {
  var i, len, lines;

  if (!text) return;

  lines = text.match(this.re.lines);
  lines.pop();

  for (i = 0, len = lines.length; i < len; i++) {
    this.text(lines[i]);
    if (i < len - 1) this.addLineStart();
  }
};

Parser.prototype.addTag = function(type, content, padding) {
  switch (type) {
    case '=':
      this.setDelimiters(content);
      break;
    case '!':
      break;
    case '#':
      this.openSection(content, {sectionType: 'section'});
      break;
    case '^':
      this.openSection(content, {sectionType: 'inverted'});
      break;
    case '?':
      this.openSection(content, {sectionType: 'exists'});
      break;
    case '/':
      this.closeSection(content);
      break;
    case '>':
      this.partial(content, padding);
      break;
    case '{':
    case '&':
      this.variable(content, {escape: false});
      break;
    default :
      this.variable(content, {escape: true});
      break;
  }
};

Parser.prototype.setDelimiters = function(content) {
  var tags = content.split(/\s+/);
  this.otag = tags[0];
  this.ctag = tags[1];
  this.compileRegexen();
};

Parser.prototype.openSection = function(content, options) {
  var section = {
    type: options.sectionType,
    key: content,
    tokens: [],
  };
  this.tokenCollector.push(section);
  this.sections.push(section);
  this.tokenCollector = section.tokens;
};

Parser.prototype.closeSection = function(content, options) {
  var section, last;

  if (this.sections.length === 0) {
    throw new Error('Unopened section: ' + content);
  }

  section = this.sections.pop();
  if (section.key !== content) {
    throw new Error('Unclosed section: ' + section.key);
  }

  last = this.sections.length - 1;

  this.tokenCollector =
    this.sections.length ? this.sections[last].tokens : this.tokens;
};

Parser.prototype.partial = function(content, padding) {
  this.tokenCollector.push({
    type: 'partial',
    key: content,
    indent: padding
  });
};

Parser.prototype.variable = function(content, options) {
  this.tokenCollector.push({
    type: 'variable',
    key: content,
    escape: options.escape
  });
};

Parser.prototype.text = function(text) {
  var last = this.tokenCollector.length - 1;
  if ((last >= 0) && (this.tokenCollector[last].type === 'text')) {
    this.tokenCollector[last].value += text;
  } else {
    this.tokenCollector.push({
      type: 'text',
      value: text
    });
  }
};

/**
 * Compiler
 */

function Compiler() {
  this.partialIndex = 1;
  this.partials = {};
  this.sectionIndex = 1;
  this.sections = {};
  this.lookupIndex = 1;
  this.lookups = {};
}

Compiler.prototype.compile = function(template) {
  var source, tokens = parse(template);

  source = '  return ' + this.compileTokens(tokens).substring(3) + ';';
  source = this.extractLookups(source, '  ')
         + '  i = i || "";\n'
         + this.compilePartials()
         + this.compileSections()
         + source;

  return new Function('c, w, i', source);
};

Compiler.prototype.compileTokens = function(tokens) {
  var i = 0
    , len = tokens.length
    , out = '';

  for (; i < len; i++) out += this.compileToken(tokens[i]);
  return out;
};

Compiler.prototype.compileSections = function() {
  var id
    , out = '';

  for (id in this.sections) {
    out += '  function section' + id + '(c, w, i) {\n'
         + this.extractLookups(this.sections[id], '    ')
         + '    return ' + this.sections[id].substring(3) + ';\n'
         + '  }\n';
  }

  return out;
};

Compiler.prototype.compilePartials = function() {
  var id
    , out = '';

  for (id in this.partials) {
    out += '  var partial' + id
         + ' = w.loadTemplate(' + this.partials[id] + ');\n';
  }

  return out;
};

Compiler.prototype.compileToken = function(token) {
  return this['compile_' + token.type](token);
};

Compiler.prototype.compileLookup = function(key) {
  var ref = 'lookup' + this.lookupIndex++;
  var source = 'c.lookup(' + key + ');\n';
  this.lookups[ref] = source;
  return ref;
};

Compiler.prototype.extractLookups = function(source, indent) {
  var i, len, ref, source
    , refs = {}
    , out = ''
    , lookupRE = /lookup(\d+)/g
    , lookups = source.match(lookupRE);

  if (lookups) {
    for (i = 0, len = lookups.length; i < len; i++) {
      ref = lookups[i];
      source = this.lookups[ref];
      out += indent
           + 'var ' + ref + ' = ' + (refs[source] || this.lookups[ref]);
      refs[source] = ref + ';\n';
    }
  }
  return out;
};

Compiler.prototype.compile_text = function(token) {
  return ' + ' + e(token.value) + '';
};

Compiler.prototype.compile_sol = function(token) {
  return ' + i';
};

Compiler.prototype.compile_variable = function(token) {
  var lookupRef = this.compileLookup(token.key);

  return ' + w.variable('
    + lookupRef
    + ', c, ' + token.escape + ')';
};

Compiler.prototype.compile_partial = function(token) {
  var index = this.partialIndex++;

  this.partials[index] = token.key;

  return ' + partial' + index + '(c, ' +  e(token.indent) + ')';
};

Compiler.prototype.compileSectionTokens = function(token, sectionType) {
  var index = this.sectionIndex++
    , lookupRef = this.compileLookup(token.key);

  this.sections[index] = this.compileTokens(token.tokens);

  return ' + w.' + sectionType + '('
    + lookupRef
    + ', c, section' + index + ', i)';
};

Compiler.prototype.compile_section = function(token) {
  return this.compileSectionTokens(token, 'section');
};

Compiler.prototype.compile_inverted = function(token) {
  return this.compileSectionTokens(token, 'inverted');
};

Compiler.prototype.compile_exists = function(token) {
  return this.compileSectionTokens(token, 'exists');
};

/**
 * Writer
 */

var Writer = {};

Writer.set = function(options) {
  this.indent = (options && options.indent) ? options.indent : '';
  return this;
};

Writer.noop      = function() { return ''; };
Writer.stringify = function(obj) { return obj ? ('' + obj) : ''; }
Writer.isArray   = isArray;
Writer.Amp       = /&/g;
Writer.Lt        = /</g;
Writer.Gt        = />/g;
Writer.Quot      = /"/g;
Writer.escapeRE  = /[&"<>]/g;

Writer.escapeHTML = function(str) {
  return this.escapeRE.test(str)
    ? str
      .replace(this.Amp,'&amp;')
      .replace(this.Lt,'&lt;')
      .replace(this.Gt,'&gt;')
      .replace(this.Quot, '&quot;')
    : str;
};

Writer.cache = {};

Writer.clearCache = function() {
  this.cache = {};
};

Writer.loadTemplate = function(name) {
  return this.cache[name] || this.noop;
};

Writer.compile = function(template) {
  var compiler = new Compiler()
    , fn = compiler.compile(template)
    , self = this;

  return function(view, indent) {
    return fn(Context.wrap(view), self, indent);
  };
}

Writer.compilePartial = function(name, template) {
  this.cache[name] = this.compile(template);
  return this.cache[name];
}

Writer.sol = function() {
  return this.indent;
};

Writer.variable = function(value, context, escape) {
  if (typeof value === 'function') {
    value = value.call(context.root);
  }

  value = value ? ('' + value) : '';

  return escape
    ? this.escapeHTML(value)
    : value;
};

Writer.partial = function(value, context, options) {
  return this.loadTemplate(value)(context, options);
};

Writer.section = function(value, context, fn, indent) {
  var out, i, len;

  if (this.isArray(value)) {
    out = '';
    len = value.length;
    for (i = 0; i < len; i++) {
      out += fn(context.push(value[i]), this, indent);
    }
    return out;
  } else if (typeof value === 'function') {
    return value.call(context.root, context, this, fn);
  } else if (value) {
    return fn(context.push(value), this, indent);
  }
  return '';
};

Writer.inverted = function(value, context, fn, indent) {
  return (!value || (this.isArray(value) && value.length === 0))
    ? fn(context, this, indent)
    : '';
};

Writer.exists = function(value, context, fn, indent) {
  return (!value || (this.isArray(value) && value.length === 0))
    ? ''
    : fn(context, this, indent);
};

/**
 * Context
 */

function Context(obj, tail, root) {
  this.head = obj;
  this.tail = tail;
  this.root = root || obj;
}

Context.prototype.isArray = isArray;

Context.wrap = function(obj) {
  return (obj instanceof Context) ? obj : new Context(obj);
};

Context.prototype.push = function(obj) {
  return new Context(obj, this, this.root);
};

Context.prototype.lookup = function(key) {
  var value
    , node = this;

  while (node) {
    value = this.isArray(key)
      ? this.getPath(node.head, key)
      : (key === '.') ? node.head : node.head[key]
    if (value) return value;
    node = node.tail;
  }

  return undefined;
}

Context.prototype.getPath = function(obj, key) {
  var i = 0
    , len = key.length
    , value = obj;

  for (; i < len; i++) {
    if (!value) return undefined;
    value = value[key[i]];
  }

  return value;
}

/**
 * mote
 */

exports.cache = Writer.cache;

exports.clearCache = function() {
  Writer.clearCache();
};

exports.compile = function(template) {
  return Writer.compile(template);
}

exports.compilePartial = function(name, template) {
  return Writer.compilePartial(name, template);
}

exports.Writer = Writer;
exports.Parser = Parser;
exports.Compiler = Compiler;

exports.VERSION = "0.1.0";

})(mote);
