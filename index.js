/**
 * Module dependencies
 */

var domify = require('domify');
var spy = require('event-spy');
var el = domify(require('./template'));
var event = require('event');
var classes = require('classes');
var List = require('./linked-list');

/**
 * Export `EventDebugger`
 */

module.exports = EventDebugger;

/**
 * Initialize `EventDebugger`
 */

function EventDebugger(type) {
  if (!(this instanceof EventDebugger)) return new EventDebugger(type);
  var self = this;
  this.type = type;
  this.cursor = 0;
  this.el = el.cloneNode(true);
  this.info = this.el.querySelector('.info');
  this._more = this.el.querySelector('.more');
  document.body.appendChild(this.el);
  this.list = new List();
  this.fns = [];
  this.bind();
  this.disabled();
  event.bind(window, 'mousedown', this.mousedown.bind(this));
  spy(type, this.event.bind(this));
}

/**
 * Bind
 */

EventDebugger.prototype.bind = function() {
  var prev = this.el.querySelector('.prev');
  var next = this.el.querySelector('.next');
  var clear = this.el.querySelector('.clear');

  event.bind(this.el, 'click', function(e) { e.stopPropagation(); });
  event.bind(prev, 'click', this.prev.bind(this));
  event.bind(next, 'click', this.next.bind(this));
  event.bind(clear, 'click', this.clear.bind(this));
  event.bind(this.info, 'click', this.more.bind(this));
};

/**
 * mousedown
 */

EventDebugger.prototype.mousedown = function(e) {
  if (this.isDebugger(e.target)) return;
  this.clear();
  this.disabled();
};

/**
 * Event
 */

EventDebugger.prototype.event = function(e, fn) {
  var self = this;
  var ctx = e.currentTarget;
  var cls = classes(e.target);
  if (this.isDebugger(e.target)) return e.stopPropagation();

  this.list.add(load, unload);
  this.fns.push(fn);
  this.more();

  function load() {
    classes(ctx).add('event-debug');
    self.write(ctx, e);
    fn.call(ctx, e);
  }

  function unload() {
    classes(ctx).remove('event-debug');
  }
};

/**
 * More
 */

EventDebugger.prototype.more = function() {
  var cursor = this.list.cursor;
  var fn = this.fns[cursor];
  if (!fn) return this._more.style.opacity = 0;
  this._more.textContent = fn.toString();
  var height = +this._more.offsetHeight + 30;
  this._more.style.top = -height + 'px';
  this._more.style.opacity = 1;
};

/**
 * prev
 */

EventDebugger.prototype.prev = function() {
  this.list.prev();
  this.more();
};

/**
 * next
 */

EventDebugger.prototype.next = function() {
  this.list.next();
  this.more();
};

/**
 * Clear
 */

EventDebugger.prototype.clear = function() {
  this.info.innerText = '';
  this.fns = [];
  this.list.reset();
  this.more();
};

/**
 * Disabled
 */

EventDebugger.prototype.disabled = function() {
  var prev = classes(this.el.querySelector('.prev'));
  var next = classes(this.el.querySelector('.next'));

  if (!this.list.length) {
    prev.add('disabled');
    next.add('disabled');
    return;
  }

  if (this.list.first()) {
    prev.add('disabled');
    next.remove('disabled');
  } else if (this.list.last()) {
    prev.remove('disabled');
    next.add('disabled');
  } else {
    prev.remove('disabled');
    next.remove('disabled');
  }
};

/**
 * Write
 */

EventDebugger.prototype.write = function(ctx, e) {
  this.info.innerText = e.type + ' ' + ctx.tagName;
};

/**
 * isDebugger
 */

EventDebugger.prototype.isDebugger = function(target) {
  var node = target;
  while(node = node.parentNode) {
    if (node == document) return false;
    if (classes(node).has('event-debugger')) return true;
  }
  return false;
};
