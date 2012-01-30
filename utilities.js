/**
 * Utilities
 */

function getValue(obj, key) {
  var keys, i, len
  , value = obj;

  if (key === '.') return value;

  keys = key.split('.');
  for (i = 0, len = keys.length; i < len; i++) {
    if (!value) return undefined;
    value = value[keys[i]];
  }

  return value;
}

function lookup(stack, key) {
  var value
  , i = stack.length - 1;

  for (; i >= 0; i--) {
    value = getValue(stack[i], key);
    if (value) return value;
  }
  return undefined;
}

function variableLookup(stack, key) {
  var value = lookup(stack, key);
  if (typeof value === 'function') return value.call(stack[0]);
  else return value;
}

function stringify(obj) {
  return obj ? obj.toString() : '';
}

var isArray = Array.isArray || function(obj) {
  return Object.prototype.toString.call(obj) == '[object Array]';
};

var escapeChars = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;'
}

function escapeHTML(str) {
  return str.replace(/[&"<>]/g, function(str) {
    return escapeChars[str];
  });
}

// Credit to Simon Willison and Colin Snover:
// http://simonwillison.net/2006/Jan/20/escape/
function RE(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

exports.RE = RE;
