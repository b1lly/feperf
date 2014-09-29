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

define(function() {
  var _fep = {
    logging: false,

    /**
     * Register will extend the main fep object and attach a new module to it
     * based on the namespace you provide
     * @param {string} namespace The namespace to attach to the global fep object
     * @param {object} module Object of the containing submodule
     */
    register: function(namespace, module) {
      if (typeof this[namespace] === 'undefined') {
        this[namespace] = module;
      }
    },

    /**
     * Forward warnings to fep.log function
     * @param {string} msg the message to log
     */
    warn: function(msg, trace) {
      this.log(msg, trace, true);
    },

    /**
     * Traverse the DOM downward and execute an optional callback
     * function on each node during the process
     * @param node the root node to start traversing from
     * @param {function=} fn callback function to process on each node
     */
    walkTheDom: function(node, fn) {
      // Execute our optional callback
      if (typeof fn === 'function') {
        fn(node);
      }

      node = node.firstChild;
      while (node) {
        this.walkTheDom(node, fn);
        node = node.nextSibling;
      }
    },

    /**
     * Returns the total number of unique properties for a particular object
     * NOTE: Does not work recursively (only counts the first layer of properties)
     * @param {object} obj The object to get the size of
     * @returns {number} the size of the object
     */
    size: function(obj) {
      var size = 0;
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          size ++;
        }
      }

      return size;
    },

    /**
     * Merge two or more objects together
     */
    extend: function() {
      var options, name, src, copy, copyIsArray, clone,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length,
          deep = false;

      // Handle a deep copy situation
      if (typeof target === "boolean") {
        deep = target;

        // skip the boolean and the target
        target = arguments[i] || {};
        i++;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== "object" && typeof target !== 'function') {
        target = {};
      }

      for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null ) {
          // Extend the base object
          for (name in options) {
            src = target[name];
            copy = options[name];

            // Prevent never-ending loop
            if (target === copy) {
              continue;
            }

            // Recurse if we're merging plain objects or arrays
            if (deep && copy && (fep.isPlainObject(copy) || (copyIsArray = fep.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && fep.isArray(src) ? src : [];
              } else {
                clone = src && fep.isPlainObject(src) ? src : {};
              }

              // Never move original objects, clone them
              target[name] = fep.extend(deep, clone, copy);

            // Don't bring in undefined values
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }

      // Return the modified object
      return target;
    },

    isArray: Array.isArray,

    isPlainObject: function( obj ) {
      if ( typeof obj !== "object" || obj.nodeType) {
        return false;
      }

      return true;
    },

    /**
     * Scrolls to a particular element on the page
     * @param {jQueryObject} $el The element to scroll too
     * @param {number} [opt_speed=1000] The time it takes to scroll from current to next
     * @param {number} [opt_topOffset=0] Add an additional offset from the element we're scrolling too
     */
    scrollTo: function($el, opt_speed, opt_topOffset) {
      if (typeof $el === undefined) {
        return;
      }

      // Set default values
      opt_speed = opt_speed || 1000;
      opt_topOffset = opt_topOffset || 0;

      $('html, body').animate({
        scrollTop: $el.offset().top - opt_topOffset
      }, opt_speed);
    }
  };

  return _fep;
});
