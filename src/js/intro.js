(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define([], factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.fep = factory();
    }
}(this, function () {
  var define = function(mod, deps, fn) {
    var modules = mod.split('/'),
        moduleDeps = [],
        namespace = window;


    for (var k = 0; k < deps.length; k ++) {
      deps[k] = deps[k].replace('/', '.');
      moduleDeps.push(provide(deps[k]));
    }


    for (var i = 0; i < modules.length; i++) {
      namespace[modules[i]] = namespace[modules[i]] || fn.apply(this, moduleDeps);
      namespace = namespace[modules[i]];
    }
  }

    /**
     * Provide a namespace for a particular module if it doesn't already exist
     * to enable modules to be augemented much easier
     * @param {string} namespaceString A string representation of the namespace
     */
   var provide = function(namespaceString) {
      var modules = namespaceString.split('.'),
          namespace = window;

      for (var i = 0; i < modules.length; i++) {
        namespace[modules[i]] = namespace[modules[i]] || {};
        namespace = namespace[modules[i]];
      }

      return namespace;
    };