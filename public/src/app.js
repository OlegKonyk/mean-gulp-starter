(function() {
  'use strict';
  angular
  .module('app', ['ngMaterial', 'ngRoute'])
  .config(config)
  .component('edAbout', {
    template: '<md-content class="md-padding"><h1>ABOUT</h1></md-content>'
  })
  .component('edHome', {
    template: '<md-content class="md-padding"><ed-hero></ed-hero></md-content>'
  })
  .constant('API_URL', 'http://localhost:7777/');

  function config($mdThemingProvider, $mdIconProvider,
                 $routeProvider, $locationProvider, API_URL) {
    "ngInject";
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        template: '<ed-home></ed-home>'
      })
      .when('/about', {
        template: '<ed-about></ed-about>'
      })
      .otherwise({
        redirectTo: '/'
      });

    /* $mdIconProvider
        .defaultIconSet("./assets/svg/avatars.svg", 128)
        .icon("menu", "./assets/svg/menu.svg", 24) */

    $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('yellow');
  }
})();

