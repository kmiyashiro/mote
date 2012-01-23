/**
 * Utilities
 */

var isArray = Array.isArray || function(obj) {
  return Object.prototype.toString.call(obj) == '[object Array]';
};

var isNumber = function(obj) {
  return Object.prototype.toString.call(obj) == '[object Number]';
};

var isString = function(obj) {
  return Object.prototype.toString.call(obj) == '[object String]';
};

/**
 * Tokens
 */

function Tokens(template) {
  this.tokens = [];
  if (!template) return;
  template = this.stripStandaloneTags(template);
  this.tokenize(template);
}

Tokens.prototype.RE = {
  newline: /(\r\n|\n)/g,
  tag: /\{\{(!|\{|&|#|\/|\^|>)?\s*(\S[\s\S]*?)\s*\}?\}\}/gm,
  line: /(?:.*(\r\n|\n)?)/g,
  standalone: /^(\s*)(\{\{(?:#|\/|\^|!)[^\{]*\}\})(\s*)$/,
  multilineCommentStart: /^\s*\{\{!\s*$/,
  multilineCommentEnd: /^\s*\}\}\s*$/,
};

Tokens.prototype.stripStandaloneTags = function(template) {
  var i, len, line
    , inComment = false
    , out = []
    , lines = template.match(this.RE.line);

  for (i = 0, len = lines.length; i < len; i++) {
    line = lines[i];

    if (this.RE.multilineCommentStart.test(line)) {
      inComment = true;
      continue;
    }

    if (inComment) {
      if (this.RE.multilineCommentEnd.test(line)) inComment = false;
      continue;
    }

    out.push(line.replace(this.RE.standalone, '$2'));
  }

  return out.join('');
};

Tokens.prototype.tokenize = function(template) {
  var m, i = 0;

  if (!template) return;

  while (m = this.RE.tag.exec(template)) {
    if (i < m.index) this.tokenizeText(template.substring(i, m.index));
    this.tokenizeTag(m[1], m[2]);
    i = this.RE.tag.lastIndex;
  }

  if (i < template.length) this.tokenizeText(template.substring(i));
};

Tokens.prototype.tokenizeTag = function(type, key) {
  var escape = true;
  if (type === '!') this.commentToken();
  else if (type === '#') this.specialTagToken(key, 'openTag');
  else if (type === '/') this.specialTagToken(key, 'closeTag');
  else if (type === '^') this.specialTagToken(key, 'invertTag');
  else if (type === '>') this.specialTagToken(key, 'partialTag');
  else if (type === '{') this.tagToken(key, false);
  else if (type === '&') this.tagToken(key, false);
  else this.tagToken(key, true);
};

Tokens.prototype.tokenizeText = function(str) {
  var m, i = 0;

  while (m = this.RE.newline.exec(str)) {
    if (i < m.index) this.textToken(str.substring(i, m.index));
    this.newlineToken(m[1]);
    i = this.RE.newline.lastIndex;
  }

  if (i < str.length) this.textToken(str.substring(i));
};

Tokens.prototype.tagToken = function(key, escape) {
  this.tokens.push({
    type: 'tag',
    key: key,
    escape: escape
  });
};

Tokens.prototype.specialTagToken = function(key, type) {
  this.tokens.push({
    type: type,
    key: key
  });
};

Tokens.prototype.commentToken = function() {
  this.tokens.push({
    type: 'comment'
  });
};

Tokens.prototype.textToken = function(value) {
  this.tokens.push({
    type: 'text',
    value: value
  });
};

Tokens.prototype.newlineToken = function(value) {
  this.tokens.push({
    type: 'newline',
    value: value
  });
};

Tokens.prototype.each = function(cb) {
  var i = 0, len = this.tokens.length;
  for (;i < len; i++) {
    cb(this.tokens[i], i);
  }
};

Tokens.prototype.push = function(token) {
  this.tokens.push(token);
};

/**
 * HTML Escaping
 */

var escape = {
  chars: /[&"<>]/g,
  map: { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }
}

function escapeHTML(str) {
  return str.replace(escape.chars, function(char) {
    return escape.map[char];
  });
}

/**
 * Evaluate
 */

function stringify(obj) {
  if (!obj) return '';
  return obj.toString();
}

function get(obj, key) {
  var value = obj, keys, i, len;

  if (key === '.') return obj;

  keys = key.split('.');

  for (i = 0, len = keys.length; i < len; i++) {
    if (value) value = value[keys[i]];
  }

  return value;
}

function lookup(stack, key) {
  var i = stack.length - 1, value;
  for (; i >= 0; i--) {
    if (value = get(stack[i], key)) return value;
  }
  return undefined;
}

function evaluate(tokens, context) {
  var out = []
    , stack = isArray(context) ? context : [context]
    , sections = []
    , sectionTokens
    , invert = false;

  function output(obj) {
    if (isArray(obj)) out.concat(obj);
    else out.push(obj);
  }

  tokens.each(function(token, index) {
    var s, begin, sContext, i, len, renderSection;

    if (sections.length > 0) {
      if (token.type === 'openTag') {
        sections.push(token.key);
        sectionTokens.push(token);
        return;
      } else if (token.type === 'invertTag') {
        sections.push(token.key);
        sectionTokens.push(token);
        return;
      } else if (token.type ==='closeTag') {
        if (sections.length > 1) {
          sections.pop();
          sectionTokens.push(token);
          return;
        }
      } else {
        sectionTokens.push(token);
        return;
      }
    }

    if (token.type === 'text') {
      output(token.value);
    }

    if (token.type === 'newline') {
      output(token.value);
    }

    if (token.type === 'tag') {
      s = stringify(lookup(stack, token.key));
      s = token.escape ? escapeHTML(s) : s;
      output(s);
    }

    if (token.type === 'openTag') {
      sectionTokens = new Tokens();
      sections.push(token.key);
      invert = false;
    }

    if (token.type === 'invertTag') {
      sectionTokens = new Tokens();
      sections.push(token.key);
      invert = true;
    }

    if (token.type === 'closeTag') {
      sections.pop();
      sContext = lookup(stack, token.key);
      if (isArray(sContext) && (sContext.length === 0)) sContext = false;
      renderSection = invert ? !sContext : sContext;
      if (renderSection) {
        if (isArray(sContext)) {
          for (i = 0, len = sContext.length; i < len; i++) {
            output(evaluate(sectionTokens, stack.concat(sContext[i])));
          }
        }
        else {
          output(evaluate(sectionTokens, stack.concat(sContext)));
        }
      }
    }
  });

  return out.join('');
}

/**
 * Render
 */

function render(template, context) {
  var tokens = new Tokens(template);
  return evaluate(tokens, context);
}

module.exports = {
  render: render,
  Tokens: Tokens
}
