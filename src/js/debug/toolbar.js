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
  var $document = $(document),
      $fepToolbar = $document.find('#fep-debug-toolbar');

  /**
   * Initialize the toolbar and interactions --
   * Add all the performance data from the debug API
   */
  _toolbar.init = function() {
    if (_toolbar.jQuerySupport()) {
      // Make sure the user has the required fep component
      if (typeof fep.debug.init === 'function') {
        _performanceMetrics = fep.debug.init();

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