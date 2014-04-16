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

var fep = (function(window, document, undefined) {
  return {
    logging: false,

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
      if (this.logging) {
        var caller = arguments.callee.caller.name || 'anonymous';

        trace = trace || false,
        warning = warning || false;

        if (typeof window.console === 'object' &&
            typeof window.console.log === 'function') {
              trace ? msg = caller + ': ' + msg : msg;
              warning ? window.console.warn(msg) : window.console.log(msg);
        } else {
          alert('Get a modern browser you noob!');
        }
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
})(window, document);

/**
 * Debugging helper methods to track performance --
 * e.g. Network Latency, Parsing Latency, Event Listeners, Memory usage
 */
fep.provide('fep.debug');
(function(fep, window, document, undefined) {
  var _debug = fep.debug;

  // Contains a list of all the page stats from our API
  _debug.pageStats = {};

  // Contains a list of all the event listeners on the page
  _debug.eventListeners = {
    count: 0,
    listeners : []
  };

  _debug.cssRules = {};

  _debug.init = function(){
    this.profileAllJs();
    this.trackEventListeners();

    var stats = {
      network : this.profileNetwork(),
      parsing : this.profilePageLoad(),
      events : this.eventListeners
    };

    _debug.pageStats = fep.extend(_debug.pageStats, stats);

    return _debug.pageStats;
  };

  /**
   * Check to see if the browser has access to the HTML5 performance object
   * @returns {boolean} true or false
   */
  _debug.hasPerformanceSupport = function() {
    return typeof window.performance === 'object';
  };

  /**
   * Check to see if the browser has access to the HTML5 timing object
   * @returns {boolean} true or false
   */
  _debug.hasTimingSupport = function() {
    return _debug.hasPerformanceSupport() &&
           typeof window.performance.timing === 'object';
  };

  /**
   * Check to see if the browser has access to the HTML5 navigation object
   * @returns {boolean} true or false
   */
  _debug.hasNavigationSupport = function() {
    return _debug.hasPerformanceSupport() &&
           typeof window.performance.navigation === 'object';
  };

  /**
   * Take an object and append ms to the end of all of the properties values
   * @param {Object} obj object with properties to append 'ms' to
   * @returns {Object} new object with 'ms' concatenated to all properties
   */
  _debug.appendMilliseconds = function(obj) {
    if (typeof obj === 'object') {
      for (var property in obj) {
        obj[property] = obj[property] >= 0 ? Math.round(obj[property] * 100) / 100 + 'ms' : undefined;
      }
    } else {
      fep.warn('Sorry, you need to pass in an object!');
    }

    return obj;
  };

  /**
   * Get all the page resources based on their initiator
   * e.g. where it was requested from (link, script, css, etc)
   */
  _debug.getResourcesByInitiator = function() {
    var entries = [],
        initiators = {};

    if (_debug.hasPerformanceSupport() &&
        typeof window.performance.getEntries == 'function') {
      entries = window.performance.getEntries();

      for (var i = 0; i < entries.length; i++) {
        // Check to see if we already have the resource in our list of initiators
        // and create it if it doesn't exist
        if (!initiators.hasOwnProperty(entries[i].initiatorType)) {
          initiators[entries[i].initiatorType] = [];
        }

        initiators[entries[i].initiatorType].push(entries[i]);
      }
    } else {
      fep.warn('Your browser doesn\'t support this feature!');
    }

    initiators = {
      resourcesByInitiator : initiators,
      latencySumByInitiator : _debug.getLatencySumByInitiator(initiators),
      resourceCountByInitiator : _debug.getResourceCountByInitiator(initiators)
    };

    return initiators;
  };

  /**
   * Get the Sum Latency for all the resources segmented type
   * @param {object} collection a map of initiators and resources
   * @returns {object} map including the original collection and the sum of latencies
   */
  _debug.getLatencySumByInitiator = function(collection) {
    var latencySumByInitiator = {};

    for (var type in collection) {
      latencySumByInitiator[type] = 0;

      // Add up all the resources durations
      for (var resource in collection[type]) {
        latencySumByInitiator[type] += collection[type][resource].duration;
      }
    }

    latencySumByInitiator.totalLatency = _debug.getResourceLatencyTotal(latencySumByInitiator);
    latencySumByInitiator = _debug.appendMilliseconds(latencySumByInitiator);

    return latencySumByInitiator;
  };

  /**
   * Add up all the resource type sums into one total
   * @param {object} collection a map of resource types and their sum latency
   */
  _debug.getResourceLatencyTotal = function(collection) {
    var totalLatency = 0;
    for (var resource in collection) {
      totalLatency += parseFloat(collection[resource]);
    }

    return totalLatency;
  };

  /**
   * A quick way to access the total number of resources per type
   * @param {object} collection raw map of resources and types
   */
  _debug.getResourceCountByInitiator = function(collection) {
    var resourceCountByInitiator = {};

    for (var type in collection) {
      resourceCountByInitiator[type] = collection[type].length;
    }

    return resourceCountByInitiator;
  };

  /**
   * Overide the native js prototypes of addEventListener and
   * removeEventListener to collect information about them
   * when they get invoked
   */
  _debug.trackEventListeners = function() {
    // Store a reference of the original functionality
    var _addEventListener = Node.prototype.addEventListener;
    Node.prototype.addEventListener = function() {
      // Keep track of what it was invoked for
      _debug.eventListeners.count ++;
      _debug.eventListeners.listeners.push({
        type : arguments[0],
        node : arguments[1].elem
      });

      // Call the original functionality
      _addEventListener.apply(this, arguments);
    }

    var _removeEventListener = Node.prototype.removeEventListener;
    Node.prototype.removeEventListener = function() {
      _debug.eventListeners.count --;
    }
  };

  /**
   * Hook into the function prototype for the call method
   * and override it to add some timestamps in our tracestack
   */
  _debug.profileAllJs = function() {
    fep.log('hook into js call stack and future calls -- to profile performance');
  };

  /**
   * Determine the execution time of a function
   * @param {Object} fn the function to test
   * @returns {Object} js timestamp of execution time
   */
  _debug.profileJs = function(fn) {
    var start = new Date().getMilliseconds();

    if (typeof fn === 'function') {
      fn.call(this);
    } else {
      fep.warn('Please provide a callback function!');
      return false;
    }

    return new Date().getMilliseconds() - start;
  };

  /**
   * Get some high level metrics related to the network
   * request in addition to the data it was extracted from for lower level details
   * @returns {object} returns an object containing networkLatency and the native timing object
   */
  _debug.profileNetwork = function() {
    var _timing,
        resources = {},
        networkLatency = {};

    if (_debug.hasTimingSupport()) {
        _timing = window.performance.timing;

        networkLatency = {
          unload : _timing.unloadEventEnd - _timing.navigationStart,

          redirect : _timing.redirectEnd - _timing.redirectStart,
          domainLookup : _timing.domainLookupEnd - _timing.domainLookupStart,
          tcpConnection : _timing.connectEnd - _timing.connectStart,
          request : _timing.responseStart - _timing.requestStart,
          response : _timing.responseEnd - _timing.responseStart,

          totalLatency : _timing.responseEnd - _timing.fetchStart
        };

        networkLatency = _debug.appendMilliseconds(networkLatency);
        resources = _debug.getResourcesByInitiator();

        //mssupport msFirstPaint instead of secureConnectionStart after loadEventEnd
    } else {
      fep.warn('Browser not supported yet!');
    }

    return {
      timing : _timing,
      pageLoad : networkLatency,
      resources : resources
    };
  };

  /**
   * Get some high level metrics related to the pageLoad speed
   * in addition to the data it was extract from for lower level details
   */
  _debug.profilePageLoad = function() {
    var _timing,
        jsLatency = 0;
        parsingLatency = {};

    if (_debug.hasTimingSupport()) {
      _timing = window.performance.timing;

      if (_debug.profiler) {
        jsLatency = fep.debug.profiler.get('jsLoad').getTime();
      }

      parsingLatency = {
        totalLatency : _timing.loadEventEnd - _timing.responseEnd + jsLatency,
        domParsing : _timing.domInteractive - _timing.domLoading,
        resourceParsing : _timing.domComplete - _timing.domInteractive,
        jsParsing: jsLatency
      };
    } else {
      fep.warn('Browser not supported yet!');
    }

    parsingLatency = _debug.appendMilliseconds(parsingLatency);

    return {
      timing : _timing,
      parsingLatency: parsingLatency
    }
  };

  return _debug;
})(fep, window, document);
/**
 * Parsing/profiling module
 */
fep.provide('fep.debug.profiler');
(function(fep, window, document, undefined) {
  var _profiler = fep.debug.profiler;

  /**
   * A collection of profiles, keyed by their name
   * @private
   */
  _profiler.profilers_ = {};

  /**
   * @constructor
   */
  var Profiler = function(name) {
    this.name = name;

    this.startTime = 0;
    this.endTime = 0;
    this.timeElapsed = 0;
  };

  /**
   * Creates the initial timestamp for the profile
   */
  Profiler.prototype.start = function() {
    this.startTime = new Date();
    fep.log('started profiling: ' + this.name);
  };

  /**
   * Creates the ending timestamp of you're profile
   * and computes the difference from the start
   */
  Profiler.prototype.stop = function() {
    this.endTime = new Date();
    this.timeElapsed = this.endTime - this.startTime;
    fep.log('stopped profiling: ' + this.name + ' (' + this.timeElapsed + ')');
  };

  /**
   * Returns the timeElapsed for a particular profile
   */
  Profiler.prototype.getTime = function() {
    return this.timeElapsed;
  };

  /**
   * Creates a new profile
   * @param {string} name The key for your profile
   */
  _profiler.create = function(name) {
    if (typeof name !== 'string') {
      return fep.log('please provide a profiler name.');
    }

    var profiler = new Profiler(name);

    _profiler.profilers_[name] = profiler;

    fep.log(_profiler.profilers_);
    return profiler;
  };

  /**
   * Retrieves a profile based on the key
   * @param {string} name The key of the profile
   */
  _profiler.get = function(name) {
    if (typeof name === 'string') {
      return _profiler.profilers_[name] || new Profiler('anonymous');
    }
  };
})(fep, window, document);
/**
 * Handle all the debug toolbar interactions
 * and data manipulations
 *
 * @requires fep.debug module
 * @requires jQuery 1.9.1+
 */
fep.provide('fep.debug.toolbar');
(function(fep, window, document, undefined) {
  var _toolbar = fep.debug.toolbar,
      _performanceMetrics = {};

  // Max expected speeds before considered slow --
  // This helps us color code (e.g. green for fast) our data for the user
  var performanceCriteria = {
    networkLatency : {
      totalLatency: 500,
      redirect : 10,
      domainLookup : 50,
      tcpConnection : 10,
      request : 300,
      response : 170
    },

    parsingLatency : {
      totalLatency : 60,
      domParsing : 300,
      resourceParsing : 100
    },

    resourceLatency : {
      link : 100,
      script : 100,
      css : 300,
      img : 500,
      xmlhttprequest : 100
    }
  };

  // jQuery Objects
  var $document = undefined,
      $fepToolbar = undefined;

  /**
   * Initialize the toolbar and interactions --
   * Add all the performance data from the debug API
   */
  _toolbar.init = function() {
    if (_toolbar.jQuerySupport()) {
      // Make sure the user has the required fep component
      if (typeof fep.debug.init === 'function') {
        _performanceMetrics = fep.debug.init();

        // Incase the toolbar html was loaded after the js evaluated
        $document = $(document);
        $fepToolbar = $document.find('#fep-debug-toolbar');

        this.setNetworkLatency(_performanceMetrics.network.pageLoad);
        this.setResourceLatency(_performanceMetrics.network.resources);
        this.setParsingLatency(_performanceMetrics.parsing.parsingLatency);
        this.bindDetails();
        this.linkMetricsToBar();
        this.bindClose();

        $fepToolbar.fadeIn(); // Display our Toolbar to user
        $document.find('body').css('margin-top', $fepToolbar.outerHeight(true));
      } else {
        fep.log('This toolbar requires the fep.debug module!');
        return false;
      }
    } else {
      fep.log('jQuery is required in order to use this!');
      return false;
    }
  };

  /**
   * Check for jQuery support
   * @returns {boolean} true if jQuery is loaded
   */
  _toolbar.jQuerySupport = function() {
    return typeof jQuery === 'function';
  };

  /**
   * Create a map of the network metrics to their relative DOM nodes
   * and update them with the data from the debug Module
   * @param {object} data the collection of network metrics from fep.debug
   */
  _toolbar.setNetworkLatency = function(data) {
    var domMap = {
      totalLatency : $fepToolbar.find('.network-latency'),
      redirect : $fepToolbar.find('.redirect'),
      domainLookup : $fepToolbar.find('.domain-lookup'),
      tcpConnection : $fepToolbar.find('.tcp-connection'),
      request : $fepToolbar.find('.request'),
      response : $fepToolbar.find('.response'),
      unload : $fepToolbar.find('unload')
    };

    _toolbar.updateDom(domMap, data, 'networkLatency');
  };

  /**
   * Create a map of the parsing metrics to their relative DOM nodes
   * and update them with the data from the debug Module
   * @param {Object} data the collection of network metrics from fep.debug
   */
  _toolbar.setParsingLatency = function(data) {
    var domMap = {
      totalLatency : $fepToolbar.find('.parsing-latency'),
      domParsing : $fepToolbar.find('.dom-parsing'),
      resourceParsing : $fepToolbar.find('.resource-parsing'),
      jsParsing: $fepToolbar.find('.js-parsing')
    };

    _toolbar.updateDom(domMap, data, 'parsingLatency');
  };

  _toolbar.setResourceLatency = function(data) {
    var domMap = {
      totalLatency : $fepToolbar.find('.resource-latency'),
      link : $fepToolbar.find('.resource-link'),
      script : $fepToolbar.find('.resource-script'),
      css : $fepToolbar.find('.resource-css'),
      img : $fepToolbar.find('.resource-img'),
      xmlhttprequest : $fepToolbar.find('.resource-xhr')
    };

    // Update DOM latency value
    _toolbar.updateDom(domMap, data.latencySumByInitiator, 'resourceLatency');

    // Update DOM resource count
    for (var metric in data.resourceCountByInitiator) {
      domMap[metric].first()
        .removeClass('red green yellow')
        .html(data.resourceCountByInitiator[metric]);
    };
  };

  /**
   * Iterate through the data collection and update the relative DOM nodes
   * with the values. Also adds basic performance evaluation to colorize nodes.
   * @param {Object} domMap
   * @param {Object} data
   * @param {Object} type
   */
  _toolbar.updateDom = function(domMap, data, type) {
    var color,
        currentMetric, // Strips 'ms' from metric
        compareMetric; // used to compare good or bad performance

    for (var metric in data) {
      currentMetric = parseFloat(data[metric]);
      compareMetric = performanceCriteria[type][metric];

      // Evaluate the performance
      if (currentMetric > compareMetric) {
        color = 'red';
      } else {
        if (currentMetric < compareMetric / 2) {
          color = 'green';
        } else {
          color = 'yellow';
        }
      }

      // Update the node
      domMap[metric]
        .removeClass('red yellow green')
        .html(data[metric])
        .addClass(color);
    }
  };

  /**
   * Bind the interaction between the metrics and their details
   */
  _toolbar.bindDetails = function() {
    $fepToolbar.find('#metrics-wrapper li').hover(function() {
      $(this).find('.metric-details').stop().fadeToggle('fast');
    });
  };

  /**
   * A utility effect to show the user what
   * piece of the bar is being hovered over, and vice versa
   */
  _toolbar.linkMetricsToBar = function() {
    $('#fep-debug-toolbar .bar span, #fep-debug-toolbar .metric-details li').hover(function(e) {
      var $self = $(this),
          $parent = $self.parents('li');

        if ($self.parents('.bar').length > 0) {
          $parent.find('.metric-details li:eq(' + $self.index() + ')').toggleClass('hover');
        } else {
          $parent.find('.bar span:eq(' + $self.index() + ')').toggleClass('hover');
        }
    });
  };

  /**
   * Hides the toolbar on click
   */
  _toolbar.bindClose = function() {
    $fepToolbar.find('.js-toggle-close').on('click', function() {
      $fepToolbar.hide();
      $document.find('body').css('margin-top', 'auto');
    });
  };

  return _toolbar;
})(fep, window, document);