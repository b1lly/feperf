/**
 * Debugging helper methods to track performance --
 * e.g. Network Latency, Parsing Latency, Event Listeners, Memory usage
 */
wab.debug = (function(wab, window, document, undefined) {
  var _debug = wab.debug || {};

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
      wab.warn('Sorry, you need to pass in an object!');
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
      wab.warn('Your browser doesn\'t support this feature!');
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
    wab.log('hook into js call stack and future calls -- to profile performance');
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
      wab.warn('Please provide a callback function!');
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
      wab.warn('Browser not supported yet!');
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
      wab.warn('Browser not supported yet!');
    }

    parsingLatency = _debug.appendMilliseconds(parsingLatency);

    return {
      timing : _timing,
      parsingLatency: parsingLatency
    }
  };

  return _debug;
})(wab, window, document);