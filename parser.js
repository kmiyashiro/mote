var RE = require('./utilities').RE;
var Scanner = require('./scanner');
/**
 * Parser
 */

function Parser(otag, ctag) {
  this.tokens = [];
  this.tokenCollector = this.tokens;
  this.sections = [];
  this.otag = otag || '{{';
  this.ctag = ctag || '}}';
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
  tagtype: /\{|&|#|\^|\/|>|=|!/,
  allowed: /[\w\$\.]+/,
  linebeginnings: /(^|\n)([^\r\n])/g
};

Parser.prototype.standalone = function(type) {
  return type && type !== '{' && type !== '&';
};

Parser.prototype.addIndentationTo = function(str, indent) {
  return str.replace(this.re.linebeginnings, '$1' + indent + '$2');
};

Parser.prototype.parse = function(str, options) {
  options = options || {};
  if (options.indent) str = this.addIndentationTo(str, options.indent)
  if (options.otag && options.ctag) {
    this.otag = options.otag;
    this.ctag = options.ctag;
    this.compileRegexen();
  }
  this.scanner = new Scanner(str);
  while (!this.scanner.eos()) this.scanTags();
  return this.tokens;
};

Parser.prototype.scanTags = function() {
  var otag, padding, type, content, startOfLine, start, end
    , standAlone = false;

  this.scanText();

  if (startOfLine = this.scanner.startOfLine()) this.addLineStart();
  start = this.scanner.pos;

  // Match the opening tag.
  if (!(otag = this.scanner.scan(this.re.opentag))) return;

  // Handle leading whitespace
  padding = this.re.whitespace.exec(otag);
  padding = padding && padding[0];
  start += padding.length;

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

  end = this.scanner.pos;

  this.addTag(type, content, padding, start, end);
};

Parser.prototype.scanText = function(str) {
  var text = this.scanner.scanUntil(this.re.opentag);
  this.addText(text);
};

Parser.prototype.addLineStart = function() {
  this.tokenCollector.push({type: 'sol'});
};

Parser.prototype.addText = function(text) {
  var i, len
    , lines = text.match(/(.*)(\r?\n)?/g)

  lines.pop();

  for (i = 0, len = lines.length; i < len; i++) {
    this.text(lines[i]);
    if (i < len - 1) this.addLineStart();
  }
};

Parser.prototype.addTag = function(type, content, padding, start, end) {
  switch (type) {
    case '=':
      this.setDelimiters(content);
      break;
    case '!':
      break;
    case '#':
      this.openSection(content, {invert: false, start: end});
      break;
    case '^':
      this.openSection(content, {invert: true, start: end});
      break;
    case '/':
      this.closeSection(content, {end: start});
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
    type: options.invert ? 'invertedSection' : 'section',
    key: content,
    tokens: [],
    raw: options.start
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

  section.raw = this.scanner.raw.substring(section.raw, options.end);
  section.otag = this.otag;
  section.ctag = this.ctag;

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
  if (!text) return;
  if ((last >= 0) && (this.tokenCollector[last].type === 'text')) {
    this.tokenCollector[last].value += text;
  } else {
    this.tokenCollector.push({
      type: 'text',
      value: text
    });
  }
};

p = new Parser();
console.log(p.parse('hello\nworld\r\n {{> name}}'));
