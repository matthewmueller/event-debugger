
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("matthewmueller-event-spy/index.js", Function("exports, require, module",
"/**\n * Module dependencies\n */\n\nvar winlistener = window.addEventListener;\nvar nodelistener = Node.prototype.addEventListener;\n\n/**\n * Export `Spy`\n */\n\nmodule.exports = Spy;\n\n/**\n * Initialize `Spy`\n *\n * @param {String} type\n * @param {Function} fn\n */\n\nfunction Spy(type, fn) {\n  if (1 == arguments.length) {\n    fn = type;\n    type = /./;\n  }\n\n  type = ('string' == typeof type) ? new RegExp(type) : type;\n\n  window.addEventListener = function(t, eventfn) {\n    winlistener.call(this, t, function(e) {\n      if (!type.test(t)) return eventfn.apply(this, arguments);\n      fn.call(this, e, eventfn);\n    });\n  };\n\n  Node.prototype.addEventListener = function(t, eventfn) {\n    nodelistener.call(this, t, function(e) {\n      if (!type.test(t)) return eventfn.apply(this, arguments);\n      fn.call(this, e, eventfn);\n    });\n  };\n\n  return {\n    destroy: function() {\n      window.addEventListener = winlistener;\n      Node.prototype.addEventListener = nodelistener;\n    }\n  };\n}\n//@ sourceURL=matthewmueller-event-spy/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n/**\n * Expose `parse`.\n */\n\nmodule.exports = parse;\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\n/**\n * Parse `html` and return the children.\n *\n * @param {String} html\n * @return {Array}\n * @api private\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n\n  // tag name\n  var m = /<([\\w:]+)/.exec(html);\n  if (!m) throw new Error('No elements were generated.');\n  var tag = m[1];\n\n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return el.removeChild(el.lastChild);\n  }\n\n  // wrap map\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  var el = document.createElement('div');\n  el.innerHTML = prefix + html + suffix;\n  while (depth--) el = el.lastChild;\n\n  var els = el.children;\n  if (1 == els.length) {\n    return el.removeChild(els[0]);\n  }\n\n  var fragment = document.createDocumentFragment();\n  while (els.length) {\n    fragment.appendChild(el.removeChild(els[0]));\n  }\n\n  return fragment;\n}\n//@ sourceURL=component-domify/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture || false);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture || false);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * toString reference.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present, or\n * pass a regular expression to remove\n * any which match.\n *\n * @param {String|RegExp} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  if ('[object RegExp]' == toString.call(name)) {\n    return this.removeMatching(name);\n  }\n\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove all classes matching `re`.\n *\n * @param {RegExp} re\n * @return {ClassList}\n * @api private\n */\n\nClassList.prototype.removeMatching = function(re){\n  var arr = this.array();\n  for (var i = 0; i < arr.length; i++) {\n    if (re.test(arr[i])) {\n      this.remove(arr[i]);\n    }\n  }\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n  var arr = str.split(re);\n  if ('' === arr[0]) arr.shift();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n//@ sourceURL=component-classes/index.js"
));
require.register("component-format-parser/index.js", Function("exports, require, module",
"\n/**\n * Parse the given format `str`.\n *\n * @param {String} str\n * @return {Array}\n * @api public\n */\n\nmodule.exports = function(str){\n\treturn str.split(/ *\\| */).map(function(call){\n\t\tvar parts = call.split(':');\n\t\tvar name = parts.shift();\n\t\tvar args = parseArgs(parts.join(':'));\n\n\t\treturn {\n\t\t\tname: name,\n\t\t\targs: args\n\t\t};\n\t});\n};\n\n/**\n * Parse args `str`.\n *\n * @param {String} str\n * @return {Array}\n * @api private\n */\n\nfunction parseArgs(str) {\n\tvar args = [];\n\tvar re = /\"([^\"]*)\"|'([^']*)'|([^ \\t,]+)/g;\n\tvar m;\n\t\n\twhile (m = re.exec(str)) {\n\t\targs.push(m[2] || m[1] || m[0]);\n\t}\n\t\n\treturn args;\n}\n//@ sourceURL=component-format-parser/index.js"
));
require.register("component-props/index.js", Function("exports, require, module",
"\n/**\n * Return immediate identifiers parsed from `str`.\n *\n * @param {String} str\n * @return {Array}\n * @api public\n */\n\nmodule.exports = function(str, prefix){\n  var p = unique(props(str));\n  if (prefix) return prefixed(str, p, prefix);\n  return p;\n};\n\n/**\n * Return immediate identifiers in `str`.\n *\n * @param {String} str\n * @return {Array}\n * @api private\n */\n\nfunction props(str) {\n  return str\n    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n    .match(/[a-zA-Z_]\\w*/g)\n    || [];\n}\n\n/**\n * Return `str` with `props` prefixed with `prefix`.\n *\n * @param {String} str\n * @param {Array} props\n * @param {String} prefix\n * @return {String}\n * @api private\n */\n\nfunction prefixed(str, props, prefix) {\n  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n  return str.replace(re, function(_){\n    if ('(' == _[_.length - 1]) return prefix + _;\n    if (!~props.indexOf(_)) return _;\n    return prefix + _;\n  });\n}\n\n/**\n * Return unique array.\n *\n * @param {Array} arr\n * @return {Array}\n * @api private\n */\n\nfunction unique(arr) {\n  var ret = [];\n\n  for (var i = 0; i < arr.length; i++) {\n    if (~ret.indexOf(arr[i])) continue;\n    ret.push(arr[i]);\n  }\n\n  return ret;\n}\n//@ sourceURL=component-props/index.js"
));
require.register("visionmedia-debug/index.js", Function("exports, require, module",
"if ('undefined' == typeof window) {\n  module.exports = require('./lib/debug');\n} else {\n  module.exports = require('./debug');\n}\n//@ sourceURL=visionmedia-debug/index.js"
));
require.register("visionmedia-debug/debug.js", Function("exports, require, module",
"\n/**\n * Expose `debug()` as the module.\n */\n\nmodule.exports = debug;\n\n/**\n * Create a debugger with the given `name`.\n *\n * @param {String} name\n * @return {Type}\n * @api public\n */\n\nfunction debug(name) {\n  if (!debug.enabled(name)) return function(){};\n\n  return function(fmt){\n    fmt = coerce(fmt);\n\n    var curr = new Date;\n    var ms = curr - (debug[name] || curr);\n    debug[name] = curr;\n\n    fmt = name\n      + ' '\n      + fmt\n      + ' +' + debug.humanize(ms);\n\n    // This hackery is required for IE8\n    // where `console.log` doesn't have 'apply'\n    window.console\n      && console.log\n      && Function.prototype.apply.call(console.log, console, arguments);\n  }\n}\n\n/**\n * The currently active debug mode names.\n */\n\ndebug.names = [];\ndebug.skips = [];\n\n/**\n * Enables a debug mode by name. This can include modes\n * separated by a colon and wildcards.\n *\n * @param {String} name\n * @api public\n */\n\ndebug.enable = function(name) {\n  try {\n    localStorage.debug = name;\n  } catch(e){}\n\n  var split = (name || '').split(/[\\s,]+/)\n    , len = split.length;\n\n  for (var i = 0; i < len; i++) {\n    name = split[i].replace('*', '.*?');\n    if (name[0] === '-') {\n      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));\n    }\n    else {\n      debug.names.push(new RegExp('^' + name + '$'));\n    }\n  }\n};\n\n/**\n * Disable debug output.\n *\n * @api public\n */\n\ndebug.disable = function(){\n  debug.enable('');\n};\n\n/**\n * Humanize the given `ms`.\n *\n * @param {Number} m\n * @return {String}\n * @api private\n */\n\ndebug.humanize = function(ms) {\n  var sec = 1000\n    , min = 60 * 1000\n    , hour = 60 * min;\n\n  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';\n  if (ms >= min) return (ms / min).toFixed(1) + 'm';\n  if (ms >= sec) return (ms / sec | 0) + 's';\n  return ms + 'ms';\n};\n\n/**\n * Returns true if the given mode name is enabled, false otherwise.\n *\n * @param {String} name\n * @return {Boolean}\n * @api public\n */\n\ndebug.enabled = function(name) {\n  for (var i = 0, len = debug.skips.length; i < len; i++) {\n    if (debug.skips[i].test(name)) {\n      return false;\n    }\n  }\n  for (var i = 0, len = debug.names.length; i < len; i++) {\n    if (debug.names[i].test(name)) {\n      return true;\n    }\n  }\n  return false;\n};\n\n/**\n * Coerce `val`.\n */\n\nfunction coerce(val) {\n  if (val instanceof Error) return val.stack || val.message;\n  return val;\n}\n\n// persist\n\nif (window.localStorage) debug.enable(localStorage.debug);\n//@ sourceURL=visionmedia-debug/debug.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\nfunction one(selector, el) {\n  return el.querySelector(selector);\n}\n\nexports = module.exports = function(selector, el){\n  el = el || document;\n  return one(selector, el);\n};\n\nexports.all = function(selector, el){\n  el = el || document;\n  return el.querySelectorAll(selector);\n};\n\nexports.engine = function(obj){\n  if (!obj.one) throw new Error('.one callback required');\n  if (!obj.all) throw new Error('.all callback required');\n  one = obj.one;\n  exports.all = obj.all;\n};\n//@ sourceURL=component-query/index.js"
));
require.register("component-reactive/lib/index.js", Function("exports, require, module",
"/**\n * Module dependencies.\n */\n\nvar adapter = require('./adapter');\nvar AttrBinding = require('./attr-binding');\nvar TextBinding = require('./text-binding');\nvar debug = require('debug')('reactive');\nvar bindings = require('./bindings');\nvar Binding = require('./binding');\nvar utils = require('./utils');\nvar query = require('query');\n\n/**\n * Expose `Reactive`.\n */\n\nexports = module.exports = Reactive;\n\n/**\n * Bindings.\n */\n\nexports.bindings = {};\n\n/**\n * Define subscription function.\n *\n * @param {Function} fn\n * @api public\n */\n\nexports.subscribe = function(fn){\n  adapter.subscribe = fn;\n};\n\n/**\n * Define unsubscribe function.\n *\n * @param {Function} fn\n * @api public\n */\n\nexports.unsubscribe = function(fn){\n  adapter.unsubscribe = fn;\n};\n\n/**\n * Define a get function.\n *\n * @param {Function} fn\n * @api public\n */\n\nexports.get = function(fn) {\n  adapter.get = fn;\n};\n\n/**\n * Define a set function.\n *\n * @param {Function} fn\n * @api public\n */\n\nexports.set = function(fn) {\n  adapter.set = fn;\n};\n\n/**\n * Expose adapter\n */\n\nexports.adapter = adapter;\n\n/**\n * Define binding `name` with callback `fn(el, val)`.\n *\n * @param {String} name or object\n * @param {String|Object} name\n * @param {Function} fn\n * @api public\n */\n\nexports.bind = function(name, fn){\n  if ('object' == typeof name) {\n    for (var key in name) {\n      exports.bind(key, name[key]);\n    }\n    return;\n  }\n\n  exports.bindings[name] = fn;\n};\n\n/**\n * Initialize a reactive template for `el` and `obj`.\n *\n * @param {Element} el\n * @param {Element} obj\n * @param {Object} options\n * @api public\n */\n\nfunction Reactive(el, obj, options) {\n  if (!(this instanceof Reactive)) return new Reactive(el, obj, options);\n  this.el = el;\n  this.obj = obj;\n  this.els = [];\n  this.fns = options || {}; // TODO: rename, this is awful\n  this.bindAll();\n  this.bindInterpolation(this.el, []);\n}\n\n/**\n * Subscribe to changes on `prop`.\n *\n * @param {String} prop\n * @param {Function} fn\n * @return {Reactive}\n * @api private\n */\n\nReactive.prototype.sub = function(prop, fn){\n  adapter.subscribe(this.obj, prop, fn);\n  return this;\n};\n\n/**\n * Unsubscribe to changes from `prop`.\n *\n * @param {String} prop\n * @param {Function} fn\n * @return {Reactive}\n * @api private\n */\n\nReactive.prototype.unsub = function(prop, fn){\n  adapter.unsubscribe(this.obj, prop, fn);\n  return this;\n};\n\n/**\n * Get a `prop`\n *\n * @param {String} prop\n * @param {Mixed} val\n * @return {Mixed}\n * @api private\n */\n\nReactive.prototype.get = function(prop) {\n  return adapter.get(this.obj, prop);\n};\n\n/**\n * Set a `prop`\n *\n * @param {String} prop\n * @param {Mixed} val\n * @return {Reactive}\n * @api private\n */\n\nReactive.prototype.set = function(prop, val) {\n  adapter.set(this.obj, prop, val);\n  return this;\n};\n\n/**\n * Traverse and bind all interpolation within attributes and text.\n *\n * @param {Element} el\n * @api private\n */\n\nReactive.prototype.bindInterpolation = function(el, els){\n\n  // element\n  if (el.nodeType == 1) {\n    for (var i = 0; i < el.attributes.length; i++) {\n      var attr = el.attributes[i];\n      if (utils.hasInterpolation(attr.value)) {\n        new AttrBinding(this, el, attr);\n      }\n    }\n  }\n\n  // text node\n  if (el.nodeType == 3) {\n    if (utils.hasInterpolation(el.data)) {\n      debug('bind text \"%s\"', el.data);\n      new TextBinding(this, el);\n    }\n  }\n\n  // walk nodes\n  for (var i = 0; i < el.childNodes.length; i++) {\n    var node = el.childNodes[i];\n    this.bindInterpolation(node, els);\n  }\n};\n\n/**\n * Apply all bindings.\n *\n * @api private\n */\n\nReactive.prototype.bindAll = function() {\n  for (var name in exports.bindings) {\n    this.bind(name, exports.bindings[name]);\n  }\n};\n\n/**\n * Bind `name` to `fn`.\n *\n * @param {String|Object} name or object\n * @param {Function} fn\n * @api public\n */\n\nReactive.prototype.bind = function(name, fn) {\n  if ('object' == typeof name) {\n    for (var key in name) {\n      this.bind(key, name[key]);\n    }\n    return;\n  }\n\n  var obj = this.obj;\n  var els = query.all('[' + name + ']', this.el);\n  if (!els.length) return;\n\n  debug('bind [%s] (%d elements)', name, els.length);\n  for (var i = 0; i < els.length; i++) {\n    var binding = new Binding(name, this, els[i], fn);\n    binding.bind();\n  }\n};\n\n// bundled bindings\n\nbindings(exports.bind);\n//@ sourceURL=component-reactive/lib/index.js"
));
require.register("component-reactive/lib/utils.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar debug = require('debug')('reactive:utils');\nvar props = require('props');\nvar adapter = require('./adapter');\n\n/**\n * Function cache.\n */\n\nvar cache = {};\n\n/**\n * Return interpolation property names in `str`,\n * for example \"{foo} and {bar}\" would return\n * ['foo', 'bar'].\n *\n * @param {String} str\n * @return {Array}\n * @api private\n */\n\nexports.interpolationProps = function(str) {\n  var m;\n  var arr = [];\n  var re = /\\{([^}]+)\\}/g;\n\n  while (m = re.exec(str)) {\n    var expr = m[1];\n    arr = arr.concat(props(expr));\n  }\n\n  return unique(arr);\n};\n\n/**\n * Interpolate `str` with the given `fn`.\n *\n * @param {String} str\n * @param {Function} fn\n * @return {String}\n * @api private\n */\n\nexports.interpolate = function(str, fn){\n  return str.replace(/\\{([^}]+)\\}/g, function(_, expr){\n    var cb = cache[expr];\n    if (!cb) cb = cache[expr] = compile(expr);\n    return fn(expr.trim(), cb);\n  });\n};\n\n/**\n * Check if `str` has interpolation.\n *\n * @param {String} str\n * @return {Boolean}\n * @api private\n */\n\nexports.hasInterpolation = function(str) {\n  return ~str.indexOf('{');\n};\n\n/**\n * Remove computed properties notation from `str`.\n *\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nexports.clean = function(str) {\n  return str.split('<')[0].trim();\n};\n\n/**\n * Call `prop` on `model` or `view`.\n *\n * @param {Object} model\n * @param {Object} view\n * @param {String} prop\n * @return {Mixed}\n * @api private\n */\n\nexports.call = function(model, view, prop){\n  // view method\n  if ('function' == typeof view[prop]) {\n    return view[prop]();\n  }\n\n  // view value\n  if (view.hasOwnProperty(prop)) {\n    return view[prop];\n  }\n\n  // get property from model\n  return adapter.get(model, prop);\n};\n\n/**\n * Compile `expr` to a `Function`.\n *\n * @param {String} expr\n * @return {Function}\n * @api private\n */\n\nfunction compile(expr) {\n  // TODO: use props() callback instead\n  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n  var p = props(expr);\n\n  var body = expr.replace(re, function(_) {\n    if ('(' == _[_.length - 1]) return access(_);\n    if (!~p.indexOf(_)) return _;\n    return call(_);\n  });\n\n  debug('compile `%s`', body);\n  return new Function('model', 'view', 'call', 'return ' + body);\n}\n\n/**\n * Access a method `prop` with dot notation.\n *\n * @param {String} prop\n * @return {String}\n * @api private\n */\n\nfunction access(prop) {\n  return 'model.' + prop;\n}\n\n/**\n * Call `prop` on view, model, or access the model's property.\n *\n * @param {String} prop\n * @return {String}\n * @api private\n */\n\nfunction call(prop) {\n  return 'call(model, view, \"' + prop + '\")';\n}\n\n/**\n * Return unique array.\n *\n * @param {Array} arr\n * @return {Array}\n * @api private\n */\n\nfunction unique(arr) {\n  var ret = [];\n\n  for (var i = 0; i < arr.length; i++) {\n    if (~ret.indexOf(arr[i])) continue;\n    ret.push(arr[i]);\n  }\n\n  return ret;\n}\n//@ sourceURL=component-reactive/lib/utils.js"
));
require.register("component-reactive/lib/text-binding.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar debug = require('debug')('reactive:text-binding');\nvar utils = require('./utils');\n\n/**\n * Expose `TextBinding`.\n */\n\nmodule.exports = TextBinding;\n\n/**\n * Initialize a new text binding.\n *\n * @param {Reactive} view\n * @param {Element} node\n * @param {Attribute} attr\n * @api private\n */\n\nfunction TextBinding(view, node) {\n  var self = this;\n  this.view = view;\n  this.text = node.data;\n  this.node = node;\n  this.props = utils.interpolationProps(this.text);\n  this.subscribe();\n  this.render();\n}\n\n/**\n * Subscribe to changes.\n */\n\nTextBinding.prototype.subscribe = function(){\n  var self = this;\n  var view = this.view;\n  this.props.forEach(function(prop){\n    view.sub(prop, function(){\n      self.render();\n    });\n  });\n};\n\n/**\n * Render text.\n */\n\nTextBinding.prototype.render = function(){\n  var node = this.node;\n  var text = this.text;\n  var view = this.view;\n  var obj = view.obj;\n\n  // TODO: delegate most of this to `Reactive`\n  debug('render \"%s\"', text);\n  node.data = utils.interpolate(text, function(prop, fn){\n    if (fn) {\n      return fn(obj, view.fns, utils.call);\n    } else {\n      return view.get(obj, prop);\n    }\n  });\n};\n//@ sourceURL=component-reactive/lib/text-binding.js"
));
require.register("component-reactive/lib/attr-binding.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar debug = require('debug')('reactive:attr-binding');\nvar utils = require('./utils');\n\n/**\n * Expose `AttrBinding`.\n */\n\nmodule.exports = AttrBinding;\n\n/**\n * Initialize a new attribute binding.\n *\n * @param {Reactive} view\n * @param {Element} node\n * @param {Attribute} attr\n * @api private\n */\n\nfunction AttrBinding(view, node, attr) {\n  var self = this;\n  this.view = view;\n  this.node = node;\n  this.attr = attr;\n  this.text = attr.value;\n  this.props = utils.interpolationProps(this.text);\n  this.subscribe();\n  this.render();\n}\n\n/**\n * Subscribe to changes.\n */\n\nAttrBinding.prototype.subscribe = function(){\n  var self = this;\n  var view = this.view;\n  this.props.forEach(function(prop){\n    view.sub(prop, function(){\n      self.render();\n    });\n  });\n};\n\n/**\n * Render the value.\n */\n\nAttrBinding.prototype.render = function(){\n  var attr = this.attr;\n  var text = this.text;\n  var view = this.view;\n  var obj = view.obj;\n\n  // TODO: delegate most of this to `Reactive`\n  debug('render %s \"%s\"', attr.name, text);\n  attr.value = utils.interpolate(text, function(prop, fn){\n    if (fn) {\n      return fn(obj, view.fns, utils.call);\n    } else {\n      return view.get(obj, prop);\n    }\n  });\n};\n//@ sourceURL=component-reactive/lib/attr-binding.js"
));
require.register("component-reactive/lib/binding.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar parse = require('format-parser');\n\n/**\n * Expose `Binding`.\n */\n\nmodule.exports = Binding;\n\n/**\n * Initialize a binding.\n *\n * @api private\n */\n\nfunction Binding(name, view, el, fn) {\n  this.name = name;\n  this.view = view;\n  this.obj = view.obj;\n  this.fns = view.fns;\n  this.el = el;\n  this.fn = fn;\n}\n\n/**\n * Apply the binding.\n *\n * @api private\n */\n\nBinding.prototype.bind = function() {\n  var val = this.el.getAttribute(this.name);\n  this.fn(this.el, val, this.obj);\n};\n\n/**\n * Perform interpolation on `name`.\n *\n * @param {String} name\n * @return {String}\n * @api public\n */\n\nBinding.prototype.interpolate = function(name) {\n  var self = this;\n  name = clean(name);\n\n  if (~name.indexOf('{')) {\n    return name.replace(/{([^}]+)}/g, function(_, name){\n      return self.value(name);\n    });\n  }\n\n  return this.formatted(name);\n};\n\n/**\n * Return value for property `name`.\n *\n *  - check if the \"view\" has a `name` method\n *  - check if the \"model\" has a `name` method\n *  - check if the \"model\" has a `name` property\n *\n * @param {String} name\n * @return {Mixed}\n * @api public\n */\n\nBinding.prototype.value = function(name) {\n  var self = this;\n  var obj = this.obj;\n  var view = this.view;\n  var fns = view.fns;\n  name = clean(name);\n\n  // view method\n  if ('function' == typeof fns[name]) {\n    return fns[name]();\n  }\n\n  // view value\n  if (fns.hasOwnProperty(name)) {\n    return fns[name];\n  }\n\n  return view.get(name);\n};\n\n/**\n * Return formatted property.\n *\n * @param {String} fmt\n * @return {Mixed}\n * @api public\n */\n\nBinding.prototype.formatted = function(fmt) {\n  var calls = parse(clean(fmt));\n  var name = calls[0].name;\n  var val = this.value(name);\n\n  for (var i = 1; i < calls.length; ++i) {\n    var call = calls[i];\n    call.args.unshift(val);\n    var fn = this.fns[call.name];\n    val = fn.apply(this.fns, call.args);\n  }\n\n  return val;\n};\n\n/**\n * Invoke `fn` on changes.\n *\n * @param {Function} fn\n * @api public\n */\n\nBinding.prototype.change = function(fn) {\n  fn.call(this);\n\n  var self = this;\n  var view = this.view;\n  var val = this.el.getAttribute(this.name);\n\n  // computed props\n  var parts = val.split('<');\n  val = parts[0];\n  var computed = parts[1];\n  if (computed) computed = computed.trim().split(/\\s+/);\n\n  // interpolation\n  if (hasInterpolation(val)) {\n    var props = interpolationProps(val);\n    props.forEach(function(prop){\n      view.sub(prop, fn.bind(self));\n    });\n    return;\n  }\n\n  // formatting\n  var calls = parse(val);\n  var prop = calls[0].name;\n\n  // computed props\n  if (computed) {\n    computed.forEach(function(prop){\n      view.sub(prop, fn.bind(self));\n    });\n    return;\n  }\n\n  // bind to prop\n  view.sub(prop, fn.bind(this));\n};\n\n/**\n * Return interpolation property names in `str`,\n * for example \"{foo} and {bar}\" would return\n * ['foo', 'bar'].\n *\n * @param {String} str\n * @return {Array}\n * @api private\n */\n\nfunction interpolationProps(str) {\n  var m;\n  var arr = [];\n  var re = /\\{([^}]+)\\}/g;\n  while (m = re.exec(str)) {\n    arr.push(m[1]);\n  }\n  return arr;\n}\n\n/**\n * Check if `str` has interpolation.\n *\n * @param {String} str\n * @return {Boolean}\n * @api private\n */\n\nfunction hasInterpolation(str) {\n  return ~str.indexOf('{');\n}\n\n/**\n * Remove computed properties notation from `str`.\n *\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nfunction clean(str) {\n  return str.split('<')[0].trim();\n}\n//@ sourceURL=component-reactive/lib/binding.js"
));
require.register("component-reactive/lib/bindings.js", Function("exports, require, module",
"/**\n * Module dependencies.\n */\n\nvar classes = require('classes');\nvar event = require('event');\n\n/**\n * Attributes supported.\n */\n\nvar attrs = [\n  'id',\n  'src',\n  'rel',\n  'cols',\n  'rows',\n  'name',\n  'href',\n  'title',\n  'class',\n  'style',\n  'width',\n  'value',\n  'height',\n  'tabindex',\n  'placeholder'\n];\n\n/**\n * Events supported.\n */\n\nvar events = [\n  'change',\n  'click',\n  'dblclick',\n  'mousedown',\n  'mouseup',\n  'blur',\n  'focus',\n  'input',\n  'keydown',\n  'keypress',\n  'keyup'\n];\n\n/**\n * Apply bindings.\n */\n\nmodule.exports = function(bind){\n\n  /**\n   * Generate attribute bindings.\n   */\n\n  attrs.forEach(function(attr){\n    bind('data-' + attr, function(el, name, obj){\n      this.change(function(){\n        el.setAttribute(attr, this.interpolate(name));\n      });\n    });\n  });\n\n/**\n * Append child element.\n */\n\n  bind('data-append', function(el, name){\n    var other = this.value(name);\n    el.appendChild(other);\n  });\n\n/**\n * Replace element.\n */\n\n  bind('data-replace', function(el, name){\n    var other = this.value(name);\n    el.parentNode.replaceChild(other, el);\n  });\n\n  /**\n   * Show binding.\n   */\n\n  bind('data-show', function(el, name){\n    this.change(function(){\n      if (this.value(name)) {\n        classes(el).add('show').remove('hide');\n      } else {\n        classes(el).remove('show').add('hide');\n      }\n    });\n  });\n\n  /**\n   * Hide binding.\n   */\n\n  bind('data-hide', function(el, name){\n    this.change(function(){\n      if (this.value(name)) {\n        classes(el).remove('show').add('hide');\n      } else {\n        classes(el).add('show').remove('hide');\n      }\n    });\n  });\n\n  /**\n   * Checked binding.\n   */\n\n  bind('data-checked', function(el, name){\n    this.change(function(){\n      if (this.value(name)) {\n        el.setAttribute('checked', 'checked');\n      } else {\n        el.removeAttribute('checked');\n      }\n    });\n  });\n\n  /**\n   * Text binding.\n   */\n\n  bind('data-text', function(el, name){\n    this.change(function(){\n      el.textContent = this.interpolate(name);\n    });\n  });\n\n  /**\n   * HTML binding.\n   */\n\n  bind('data-html', function(el, name){\n    this.change(function(){\n      el.innerHTML = this.formatted(name);\n    });\n  });\n\n  /**\n   * Generate event bindings.\n   */\n\n  events.forEach(function(name){\n    bind('on-' + name, function(el, method){\n      var fns = this.view.fns\n      event.bind(el, name, function(e){\n        var fn = fns[method];\n        if (!fn) throw new Error('method .' + method + '() missing');\n        fns[method](e);\n      });\n    });\n  });\n};\n//@ sourceURL=component-reactive/lib/bindings.js"
));
require.register("component-reactive/lib/adapter.js", Function("exports, require, module",
"/**\n * Default subscription method.\n * Subscribe to changes on the model.\n *\n * @param {Object} obj\n * @param {String} prop\n * @param {Function} fn\n */\n\nexports.subscribe = function(obj, prop, fn) {\n  if (!obj.on) return;\n  obj.on('change ' + prop, fn);\n};\n\n/**\n * Default unsubscription method.\n * Unsubscribe from changes on the model.\n */\n\nexports.unsubscribe = function(obj, prop, fn) {\n  if (!obj.off) return;\n  obj.off('change ' + prop, fn);\n};\n\n/**\n * Default setter method.\n * Set a property on the model.\n *\n * @param {Object} obj\n * @param {String} prop\n * @param {Mixed} val\n */\n\nexports.set = function(obj, prop, val) {\n  if ('function' == typeof obj[prop]) {\n    obj[prop](val);\n  } else {\n    obj[prop] = val;\n  }\n};\n\n/**\n * Default getter method.\n * Get a property from the model.\n *\n * @param {Object} obj\n * @param {String} prop\n * @return {Mixed}\n */\n\nexports.get = function(obj, prop) {\n  if ('function' == typeof obj[prop]) {\n    return obj[prop]();\n  } else {\n    return obj[prop];\n  }\n};\n//@ sourceURL=component-reactive/lib/adapter.js"
));
require.register("matthewmueller-print-element/index.js", Function("exports, require, module",
"/**\n * Expose `print`\n */\n\nmodule.exports = print;\n\n/**\n * Initialize `print`\n *\n * @param {Element} print\n * @return {String}\n */\n\nfunction print(el) {\n  if (1 != el.nodeType && window != el) throw Error('Expecting an element node');\n  var tagName = el.tagName.toLowerCase();\n  var className = el.className.replace(/\\s+/g, '.');\n  var id = el.id;\n\n  if (className) className = '.' + className;\n  if (id) id = '#' + id;\n\n  return tagName + id + className;\n}\n//@ sourceURL=matthewmueller-print-element/index.js"
));
require.register("matthewmueller-event-debugger/index.js", Function("exports, require, module",
"/**\n * Module dependencies\n */\n\nvar reactive = require('reactive');\nvar domify = require('domify');\nvar spy = require('event-spy');\nvar el = domify(require('./template'));\nvar event = require('event');\nvar classes = require('classes');\nvar print = require('print-element');\n\n/**\n * Export `EventDebugger`\n */\n\nmodule.exports = EventDebugger;\n\n/**\n * Initialize `EventDebugger`\n */\n\nfunction EventDebugger(type) {\n  if (!(this instanceof EventDebugger)) return new EventDebugger(type);\n  var self = this;\n  this.el = el.cloneNode(true);\n  reactive(this.el, {}, this);\n  document.documentElement.appendChild(this.el);\n  this.info = this.el.querySelector('.fn-string');\n  this.stack = [];\n  this.cursor = -1;\n  event.bind(window, 'mousedown', this.mousedown.bind(this));\n  event.bind(window, type, this.done.bind(this));\n  spy(type, this.event.bind(this));\n}\n\n/**\n * Toggle showing fn\n */\n\nEventDebugger.prototype.fn = function(e) {\n  var target = e.target;\n  var cls = classes(target);\n\n  if (cls.has('active')) {\n    this.info.style.opacity = 0;\n  } else {\n    this.info.style.opacity = 1;\n  }\n\n  cls.toggle('active');\n};\n\n/**\n * prev\n */\n\nEventDebugger.prototype.prev = function(e) {\n  var target = e.target;\n  if (this.cursor <= 0) return;\n  var cur = this.stack[this.cursor];\n  if (window != cur.ctx) classes(cur.ctx).remove('event-debug');\n  var next = this.stack[--this.cursor];\n  this.step(next);\n  this.disabled();\n};\n\n/**\n * next\n */\n\nEventDebugger.prototype.next = function() {\n  if (this.cursor >= this.stack.length - 1) return;\n  var cur = this.stack[this.cursor];\n  if (window != cur.ctx) classes(cur.ctx).remove('event-debug');\n  var next = this.stack[++this.cursor];\n  this.step(next);\n  this.disabled();\n};\n\n/**\n * mousedown\n */\n\nEventDebugger.prototype.mousedown = function(e) {\n  if (this.isDebugger(e.target)) return;\n  this.clear();\n};\n\n/**\n * Done propagating\n */\n\nEventDebugger.prototype.done = function(e) {\n  var self = this;\n  setTimeout(function() {\n    self.disabled();\n  }, 0);\n};\n\n/**\n * Event\n */\n\nEventDebugger.prototype.event = function(e, fn) {\n  var self = this;\n  if (this.isDebugger(e.target)) return e.stopPropagation();\n\n  this.stack.push({\n    e: e,\n    fn: fn,\n    ctx: e.currentTarget\n  });\n\n  this.disabled();\n\n  if (~this.cursor) return this;\n  this.cursor++;\n  var slice = this.stack[this.cursor];\n  this.step(slice);\n};\n\n/**\n * Step to next function\n */\n\nEventDebugger.prototype.step = function(slice) {\n  var e = slice.e;\n  var fn = slice.fn;\n  var ctx = slice.ctx;\n  var fn = slice.fn;\n\n  if (window != ctx) {\n    var tag = print(ctx);\n    ctx.setAttribute('tag', tag);\n    classes(ctx).add('event-debug');\n    this.info.innerText = fn.toString();\n  } else {\n    this.info.innerText = 'window: ' + fn.toString();\n  }\n\n  fn.call(ctx, e);\n};\n\n/**\n * Disabled\n */\n\nEventDebugger.prototype.disabled = function() {\n  var prev = classes(this.el.querySelector('.prev'));\n  var next = classes(this.el.querySelector('.next'));\n  var len = this.stack.length;\n\n  if (!this.cursor || !len) {\n    prev.add('disabled');\n  } else {\n    prev.remove('disabled');\n  }\n\n  if (this.cursor >= len - 1) {\n    next.add('disabled');\n  } else {\n    next.remove('disabled');\n  }\n};\n\n/**\n * Clear\n */\n\nEventDebugger.prototype.clear = function() {\n  var cur = this.stack[this.cursor];\n  if (cur && window != cur.ctx) classes(cur.ctx).remove('event-debug');\n  this.stack = [];\n  this.cursor = -1;\n  this.info.innerText = '';\n  this.disabled();\n};\n\n/**\n * isDebugger\n */\n\nEventDebugger.prototype.isDebugger = function(target) {\n  var node = target;\n  while(node = node.parentNode) {\n    if (node == document) return false;\n    if (classes(node).has('event-debugger')) return true;\n  }\n  return false;\n};\n//@ sourceURL=matthewmueller-event-debugger/index.js"
));
require.register("matthewmueller-event-debugger/template.js", Function("exports, require, module",
"module.exports = '<div class=\"event-debugger\">\\n  <pre class=\"fn-string\"></pre>\\n  <div class=\"btn-group btn-group-vertical\">\\n    <button class=\"btn fn active\" on-click=\"fn\">&fnof;</button>\\n    <button class=\"btn prev\" on-click=\"prev\">&#9664;</button>\\n    <button class=\"btn next\" on-click=\"next\">&#9654;</button>\\n    <button class=\"btn clear\" on-click=\"clear\">&#10006;</button>\\n  </div>\\n</div>\\n';//@ sourceURL=matthewmueller-event-debugger/template.js"
));
require.alias("matthewmueller-event-debugger/index.js", "event-debugger/deps/event-debugger/index.js");
require.alias("matthewmueller-event-debugger/template.js", "event-debugger/deps/event-debugger/template.js");
require.alias("matthewmueller-event-debugger/index.js", "event-debugger/deps/event-debugger/index.js");
require.alias("matthewmueller-event-debugger/index.js", "event-debugger/index.js");
require.alias("matthewmueller-event-spy/index.js", "matthewmueller-event-debugger/deps/event-spy/index.js");
require.alias("matthewmueller-event-spy/index.js", "matthewmueller-event-debugger/deps/event-spy/index.js");
require.alias("matthewmueller-event-spy/index.js", "matthewmueller-event-spy/index.js");

require.alias("component-domify/index.js", "matthewmueller-event-debugger/deps/domify/index.js");

require.alias("component-event/index.js", "matthewmueller-event-debugger/deps/event/index.js");

require.alias("component-classes/index.js", "matthewmueller-event-debugger/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-reactive/lib/index.js", "matthewmueller-event-debugger/deps/reactive/lib/index.js");
require.alias("component-reactive/lib/utils.js", "matthewmueller-event-debugger/deps/reactive/lib/utils.js");
require.alias("component-reactive/lib/text-binding.js", "matthewmueller-event-debugger/deps/reactive/lib/text-binding.js");
require.alias("component-reactive/lib/attr-binding.js", "matthewmueller-event-debugger/deps/reactive/lib/attr-binding.js");
require.alias("component-reactive/lib/binding.js", "matthewmueller-event-debugger/deps/reactive/lib/binding.js");
require.alias("component-reactive/lib/bindings.js", "matthewmueller-event-debugger/deps/reactive/lib/bindings.js");
require.alias("component-reactive/lib/adapter.js", "matthewmueller-event-debugger/deps/reactive/lib/adapter.js");
require.alias("component-reactive/lib/index.js", "matthewmueller-event-debugger/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "component-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");

require.alias("visionmedia-debug/index.js", "component-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "component-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "component-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "component-reactive/deps/query/index.js");

require.alias("component-reactive/lib/index.js", "component-reactive/index.js");

require.alias("matthewmueller-print-element/index.js", "matthewmueller-event-debugger/deps/print-element/index.js");
require.alias("matthewmueller-print-element/index.js", "matthewmueller-event-debugger/deps/print-element/index.js");
require.alias("matthewmueller-print-element/index.js", "matthewmueller-print-element/index.js");

require.alias("matthewmueller-event-debugger/index.js", "matthewmueller-event-debugger/index.js");

