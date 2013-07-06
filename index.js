/**
 * Module dependencies
 */

var reactive = require('reactive');
var domify = require('domify');
var spy = require('event-spy');
var el = domify(require('./template'));
var event = require('event');
var classes = require('classes');
var print = require('print-element');

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
  this.el = el.cloneNode(true);
  reactive(this.el, {}, this);
  document.documentElement.appendChild(this.el);
  this.info = this.el.querySelector('.fn-string');
  this.stack = [];
  this.cursor = -1;
  event.bind(window, 'mousedown', this.mousedown.bind(this));
  spy(type, this.event.bind(this));
}

/**
 * Toggle showing fn
 */

EventDebugger.prototype.fn = function(e) {
  var target = e.target;
  var cls = classes(target);

  if (cls.has('active')) {
    this.info.style.opacity = 0;
  } else {
    this.info.style.opacity = 1;
  }

  cls.toggle('active');
};

/**
 * prev
 */

EventDebugger.prototype.prev = function(e) {
  var target = e.target;
  if (this.cursor <= 0) return;
  var cur = this.stack[this.cursor];
  if (window != cur.ctx) classes(cur.ctx).remove('event-debug');
  var next = this.stack[--this.cursor];
  this.step(next);
  this.disabled();
};

/**
 * next
 */

EventDebugger.prototype.next = function() {
  if (this.cursor >= this.stack.length - 1) return;
  var cur = this.stack[this.cursor];
  classes(cur.ctx).remove('event-debug');
  var next = this.stack[++this.cursor];
  this.step(next);
  this.disabled();
};

/**
 * mousedown
 */

EventDebugger.prototype.mousedown = function(e) {
  if (this.isDebugger(e.target)) return;
  this.clear();
};

/**
 * Event
 */

EventDebugger.prototype.event = function(e, fn) {
  var self = this;
  if (this.isDebugger(e.target)) return e.stopPropagation();

  this.stack.push({
    e: e,
    fn: fn,
    ctx: e.currentTarget
  });

  this.disabled();

  if (~this.cursor) return this;
  this.cursor++;
  var slice = this.stack[this.cursor];
  this.step(slice);
};

/**
 * Step to next function
 */

EventDebugger.prototype.step = function(slice) {
  var e = slice.e;
  var fn = slice.fn;
  var ctx = slice.ctx;
  var fn = slice.fn;

  if (window != ctx) {
    var tag = print(ctx);
    ctx.setAttribute('tag', tag);
    classes(ctx).add('event-debug');
    this.info.innerText = fn.toString();
  } else {
    this.info.innerText = 'window: ' + fn.toString();
  }

  fn.call(ctx, e);
};

/**
 * Disabled
 */

EventDebugger.prototype.disabled = function() {
  var prev = classes(this.el.querySelector('.prev'));
  var next = classes(this.el.querySelector('.next'));
  var len = this.stack.length;

  if (!this.cursor || !len) {
    prev.add('disabled');
  } else {
    prev.remove('disabled');
  }

  if (this.cursor >= len - 1) {
    next.add('disabled');
  } else {
    next.remove('disabled');
  }
};

/**
 * Clear
 */

EventDebugger.prototype.clear = function() {
  var cur = this.stack[this.cursor];
  if (cur) classes(cur.ctx).remove('event-debug');
  this.stack = [];
  this.cursor = -1;
  this.info.innerText = '';
  this.disabled();
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
