(function() {
  'use strict';
  angular.module('app')
    .component('toolbarMain',
    {
      bindings: {},
      template: function($templateCache) {
        "ngInject";
        return $templateCache.get('public/src/toolbarMain/toollbarMain.html');
      },
      controller: toolbarMainCtrl
    }
  );

  function toolbarMainCtrl() {
    "ngInject";

    var ctrl = this;
  }
})();
