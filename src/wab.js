/**
 * Define our main namespace to contain
 * all our general helper functionality and sub-modules
 *
 * @author Billy Bastardi (billy@yext.com)
 *
 * Todo:
 * - EventListeners per page
 * -- By Node and Type
 * -- Total Events per page
 * - Memory Consumption
 * - Total CSS Rules per page
 * - JS Profiling
 * - GUI to support data
 * - Observer Pattern to subscribe GUI to Data
 * - AJAX tracking support
 */
var wab = (function(wab, window, document, undefined) {
  var _wab = wab || {};

  /**
   * Enhanced logging functionality that will log the
   * function name of the function thats logging information
   * @param {string} msg the message to log
   * @param {boolean=false} trace display the function that called logging
   * @param {boolean=false} warning display this message as a warning or a subtle message
   */
  _wab.log = function(msg, trace, warning) {
    var caller = arguments.callee.caller.name || 'anonymous',
        trace = trace || false,
        warning = warning || false;

    if (typeof window.console === 'object' &&
        typeof window.console.log === 'function') {
          trace ? msg = caller + ': ' + msg : msg;
          warning ? console.warn(msg) : console.log(msg);
    } else {
      alert('Get a modern browser you noob!');
    }
  };

  /**
   * Forward warnings to wab.log function
   * @param {string} msg the message to log
   */
  _wab.warn = function(msg, trace) {
    _wab.log(msg, trace, true);
  };

  /**
   * Traverse the DOM downward and execute an optional callback
   * function on each node during the process
   * @param node the root node to start traversing from
   * @param {function=} fn callback function to process on each node
   */
  _wab.walkTheDom = function(node, fn) {
    // Execute our optional callback
    if (typeof fn === 'function') {
      fn(node);
    }

    node = node.firstChild;
    while (node) {
      _wab.walkTheDom(node, fn);
      node = node.nextSibling;
    }
  }

  /**
   * Get the size of an object (how many properties it has) --
   * by iterating through all the properties and counting
   * @param {object} obj the object to iterate through
   */
  _wab.size = function(obj) {
    var size = 0;
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        size ++;
      }
    }

    return size;
  };

  // Create a potential shorthand for quick access
  if (window.w === undefined) {
    window.w = _wab;
  }

  return _wab;
})(wab, window, document);
