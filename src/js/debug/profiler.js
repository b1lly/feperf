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
    fep.log('started profiling')
  };

  /**
   * Creates the ending timestamp of you're profile
   * and computes the difference from the start
   */
  Profiler.prototype.stop = function() {
    this.endTime = new Date();
    this.timeElapsed = this.endTime - this.startTime;
    fep.log(this.timeElapsed);
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