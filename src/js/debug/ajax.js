fep.provide('fep.debug.ajax');
(function() {
  _ajax = fep.debug.ajax;

  _ajax.remoteUrl = '';

  _ajax.init = function(remoteUrl, data) {
    var saveData = fep.extend(true, {}, data);

    this.remoteUrl = remoteUrl;

    // TODO(billy) Make this less fragile
    delete saveData.events.listeners;
    delete saveData.network.resources.resourcesByInitiator;

    $.post(remoteUrl, JSON.stringify(saveData));
  }
})();