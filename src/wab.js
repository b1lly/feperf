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
 */
var Wab = (function(Wab, window, document, undefined) {
  var _wab = Wab || {};

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
})(Wab, window, document);

/**
 * Debugging helper methods to track performance --
 * e.g. Network Latency, Parsing Latency, Event Listeners, Memory usage
 */
Wab.Debug = (function(Wab, window, document, undefined) {
  var _debug = Wab.Debug || {};

  _debug.eventListeners = {
    count: 0,
    listeners : []
  };

  _debug.cssRules = {};

  _debug.init = function(){
    this.profileAllJs();
    this.trackEventListeners();

    return {
      network : this.profileNetwork(),
      parsing : this.profilePageLoad(),
      events : this.eventListeners
    }
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
      for (property in obj) {
        obj[property] = obj[property] >= 0 ? Math.round(obj[property] * 100) / 100 + 'ms' : undefined;
      }
    } else {
      Wab.warn('Sorry, you need to pass in an object!');
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
      Wab.warn('Your browser doesn\'t support this feature!');
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

    for (type in collection) {
      latencySumByInitiator[type] = 0;

      // Add up all the resources durations
      for (resource in collection[type]) {
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
    for (resource in collection) {
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

    for (type in collection) {
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
    Wab.log('hook into js call stack and future calls -- to profile performance');
  };

  /**
   * Determine the execution time of a function
   * @param {Object} fn the function to test
   * @returns {Object} js timestamp of execution time
   */
  _debug.profileJs = function(fn) {
    var start = new Date().getTime();

    if (typeof fn === 'function') {
      fn();
    } else {
      Wab.warn('Please provide a callback function!');
      return false;
    }

    return new Date().getTime() - start;
  };

  /**
   * Get some high level metrics related to the network
   * request in addition to the data it was extracted from for lower level details
   * @returns {object} returns an object containing networkLatency and the native timing object
   */
  _debug.profileNetwork = function() {
    var _timing,
        pageLoad = resources = {};

    if (_debug.hasTimingSupport()) {
        _timing = window.performance.timing;

        networkLatency = {
          unload : _timing.unloadEventEnd - _timing.navigationStart,

          redirect : _timing.redirectEnd - _timing.redirectStart,
          domainLookup : _timing.domainLookupEnd - _timing.domainLookupStart,
          tcpConnection : _timing.connectEnd - _timing.connectStart,
          request : _timing.responseStart - _timing.requestStart,
          response : _timing.responseEnd - _timing.responseStart,

          totalLatency : _timing.responseEnd - _timing.fetchStart,
        };

        networkLatency = _debug.appendMilliseconds(networkLatency);
        resources = _debug.getResourcesByInitiator();

        //mssupport msFirstPaint instead of secureConnectionStart after loadEventEnd
    } else {
      Wab.warn('Browser not supported yet!');
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
        parsingLatency = {};

    if (_debug.hasTimingSupport()) {
      _timing = window.performance.timing;

      parsingLatency = {
        totalLatency : _timing.loadEventEnd - _timing.responseEnd,
        domParsing : _timing.domInteractive - _timing.domLoading,
        resourceParsing : _timing.domComplete - _timing.domInteractive
      };
    } else {
      Wab.warn('Browser not supported yet!');
    }

    parsingLatency = _debug.appendMilliseconds(parsingLatency);

    return {
      timing : _timing,
      parsingLatency: parsingLatency
    }
  };

  return _debug;
})(Wab, window, document);


/**
 * Handle all the debug toolbar interactions
 * and data manipulations
 *
 * @requires Wab.Debug module
 * @requires jQuery 1.9.1+
 */
Wab.DebugToolbar = (function(Wab, window, document, undefined) {
  var _toolbar = Wab.DebugToolbar || {},
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
      domParsing : 50,
      resourceParsing : 10
    },

    resourceLatency : {
      link : 50,
      script : 50,
      css : 50,
      img : 50,
      xhr : 50
    }
  };

  // jQuery Objects
  var $document = $(document),
      $wabToolbar = $document.find('#wab-debug-toolbar');

  /**
   * Initialize the toolbar and interactions --
   * Add all the performance data from the debug API
   */
  _toolbar.init = function() {
    if (_toolbar.jQuerySupport()) {
      // Make sure the user has the required wab component
      if (typeof Wab.Debug.init === 'function') {
        _performanceMetrics = Wab.Debug.init();

        this.setNetworkLatency(_performanceMetrics.network.pageLoad);
        this.setResourceLatency(_performanceMetrics.network.resources);
        this.setParsingLatency(_performanceMetrics.parsing.parsingLatency);
        this.bindDetails();
        this.linkMetricsToBar();

        $wabToolbar.fadeIn(); // Display our Toolbar to user
      } else {
        Wab.log('This toolbar requires the Wab.Debug module!');
        return false;
      }
    } else {
      Wab.log('jQuery is required in order to use this!');
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
   * and update them with the data from the Debug Module
   * @param {object} data the collection of network metrics from Wab.Debug
   */
  _toolbar.setNetworkLatency = function(data) {
    var domMap = {
      totalLatency : $wabToolbar.find('.network-latency'),
      redirect : $wabToolbar.find('.redirect'),
      domainLookup : $wabToolbar.find('.domain-lookup'),
      tcpConnection : $wabToolbar.find('.tcp-connection'),
      request : $wabToolbar.find('.request'),
      response : $wabToolbar.find('.response'),
      unload : $wabToolbar.find('unload')
    };

    _toolbar.updateDom(domMap, data, 'networkLatency');
  };

  /**
   * Create a map of the parsing metrics to their relative DOM nodes
   * and update them with the data from the Debug Module
   * @param {Object} data the collection of network metrics from Wab.Debug
   */
  _toolbar.setParsingLatency = function(data) {
    var domMap = {
      totalLatency : $wabToolbar.find('.parsing-latency'),
      domParsing : $wabToolbar.find('.dom-parsing'),
      resourceParsing : $wabToolbar.find('.resource-parsing')
    };

    _toolbar.updateDom(domMap, data, 'parsingLatency');
  };

  _toolbar.setResourceLatency = function(data) {
    var domMap = {
      totalLatency : $wabToolbar.find('.resource-latency'),
      link : $wabToolbar.find('.resource-link'),
      script : $wabToolbar.find('.resource-script'),
      css : $wabToolbar.find('.resource-css'),
      img : $wabToolbar.find('.resource-img'),
      xhr : $wabToolbar.find('.resource-xhr')
    };

    // Update DOM latency value
    _toolbar.updateDom(domMap, data.latencySumByInitiator, 'resourceLatency');

    // Update DOM resource count
    for (metric in data.resourceCountByInitiator) {
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
    $wabToolbar.find('#metrics-wrapper li').hover(function() {
      $(this).find('.metric-details').stop().fadeToggle('fast');
    });
  };


  /**
   * A utility effect to show the user what
   * piece of the bar is being hovered over, and vice versa
   */
  _toolbar.linkMetricsToBar = function() {
    $('#wab-debug-toolbar .bar span, #wab-debug-toolbar .metric-details li').hover(function(e) {
      var $self = $(this),
          $parent = $self.parents('li');

        if ($self.parents('.bar').length > 0) {
          $parent.find('.metric-details li:eq(' + $self.index() + ')').toggleClass('hover');
        } else {
          $parent.find('.bar span:eq(' + $self.index() + ')').toggleClass('hover');
        }
    });
  };

  return _toolbar;
})(Wab, window, document);