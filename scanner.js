module.exports = Scanner;
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
    case -1 :
      match = this.str;
      this.pos += this.str.length;
      this.str = ''
      break;
    case 0  :
      match = null;
      break;
    default :
      match = this.str.substring(0, pos);
      this.str = this.str.substring(pos);
      this.pos += pos;
  }
  return match;
};

