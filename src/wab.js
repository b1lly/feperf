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

var wab = (function(window, document, undefined) {
  return {
    /**
     * Provide a namespace for a particular module if it doesn't already exist
     * to enable modules to be augemented much easier
     * @param {string} namespaceString A string representation of the namespace
     */
    provide: function(namespaceString) {
      var modules = namespaceString.split('.'),
          namespace = window;

      for (var i = 0; i < modules.length; i++) {
        namespace[modules[i]] = namespace[modules[i]] || {};
        namespace = namespace[modules[i]];
      }
    },

    /**
     * Enhanced logging functionality that will log the
     * function name of the function thats logging information
     * @param {string} msg the message to log
     * @param {boolean=false} trace display the function that called logging
     * @param {boolean=false} warning display this message as a warning or a subtle message
     */
    log: function(msg, trace, warning) {
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
    },

    /**
     * Forward warnings to wab.log function
     * @param {string} msg the message to log
     */
    warn: function(msg, trace) {
      _wab.log(msg, trace, true);
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
        _wab.walkTheDom(node, fn);
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
     * Set the caret position on an input element.
     * Optionally select/highlight a chunk of text if you pass in a distance
     *
     * @param {jQueryObject} $el Reference of the input to position the cursor on
     * @param {number} pos The index of where to position the cursor
     * @param {number} opt_dis Optional distance to select, starting at the pos
     */
    setCaretPosition: function($el, pos, opt_dis) {
      var htmlEl = $el.get(0); // Reference the HTMLObject

      opt_dis = opt_dis || 0;

      // The native HTMLObject gives us access to the Range and Selection API
      if (htmlEl) {
        // IE Support for cursor position
        if (htmlEl.createTextRange) {
          // Timeout required to focus properly
          setTimeout(function() {
            var range = htmlEl.createTextRange();
            range.move('character', pos);
            range.moveEnd('character', opt_dis);
            range.select();
            htmlEl.focus();
          }, 0);
        } else {
          // Chrome, Safari, Firefox support
          if (htmlEl.setSelectionRange) {
            htmlEl.setSelectionRange(pos, pos + opt_dis)

            // Timeout required to focus properly
            setTimeout(function() {
              $el.focus();
            }, 0);
          }
        }
      }
    },

    /**
     * Get the caret position of a particular input
     * NOTE: The input most be focused to get the proper value
     * @param {jQueryObject} $el Reference of the input box
     * @return {number} the current index of the caret
     */
    getCaretPosition: function($el) {
      var htmlEl = $el.get(0);

      // Modern Browser Support
      if (htmlEl.selectionEnd) {
        return htmlEl.selectionEnd;
      } else if (htmlEl.createTextRange) { // IE Support
        var range = document.selection.createRange();

        var len = htmlEl.value.length;

        // Create a working TextRange that lives only in the input
        var textInputRange = htmlEl.createTextRange();
        textInputRange.moveToBookmark(range.getBookmark());

        return -textInputRange.moveStart("character", -len);
      }

      // If there is no selection, we assume the selection is at the 0 index
      return 0;
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
            if (deep && copy && (wab.isPlainObject(copy) || (copyIsArray = wab.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && wab.isArray(src) ? src : [];
              } else {
                clone = src && wab.isPlainObject(src) ? src : {};
              }

              // Never move original objects, clone them
              target[name] = wab.extend(deep, clone, copy);

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
})(window, document);
