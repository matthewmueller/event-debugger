/**
 * Export `LinkedList`
 */

module.exports = LinkedList;

/**
 * Initialize `LinkedList`
 */

function LinkedList() {
  if (!(this instanceof LinkedList)) return new LinkedList();
  this.list = [];
  this.cursor = -1;
}

/**
 * Add
 */

LinkedList.prototype.add = function(load, unload) {
  load = load || function(){};
  unload = unload || function(){};
  this.list.push([load, unload]);
  if (!~this.cursor) this.next();
};

/**
 * Next
 */

LinkedList.prototype.next = function() {
  if (this.last()) return this;
  var cur = this.list[this.cursor++];
  var next = this.list[this.cursor];
  if (cur) cur[1]();
  if (next) next[0]();
  return this;
};

/**
 * Prev
 */

LinkedList.prototype.prev = function() {
  if (this.first()) return this;
  var cur = this.list[this.cursor--];
  var prev = this.list[this.cursor];
  if (cur) cur[1]();
  if (prev) prev[0]();
  return this;
};

/**
 * Current
 */

LinkedList.prototype.current = function() {
  return this.list[this.cursor];
};

/**
 * First
 */

LinkedList.prototype.first = function() {
  if (!this.cursor) return true;
};

/**
 * Last
 */

LinkedList.prototype.last = function() {
  if (this.cursor == this.list.length - 1) return true;
  return false;
};

/**
 * Clear
 */

LinkedList.prototype.reset = function() {
  var list = this.list;
  for (var i = 0, len = list.length; i < len; i++) {
    list[i][1]();
  }

  this.list = [];
  this.cursor = -1;
  return this;
};
