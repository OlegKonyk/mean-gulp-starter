"use strict";

(function () {
  'use strict';

  config.$inject = ["$mdThemingProvider", "$mdIconProvider", "$routeProvider", "$locationProvider", "$authProvider", "API_URL", "$httpProvider"];
  angular.module('app', ['ngRoute', 'ngMaterial', 'ngMessages', 'ngResource', 'satellizer', 'youtube-embed']).config(config).component('edAbout', {
    template: '<md-content class="md-padding"><h1>ABOUT</h1></md-content>'
  }).component('edHome', {
    template: '<md-content class="md-padding"><ed-hero></ed-hero></md-content>'
  }).constant('API_URL', 'http://localhost:3030/').factory('authInterceptor', ["$injector", function ($injector) {
    return {
      request: function request(config) {
        // injected manually to get around circular dependency problem.
        var $auth = $injector.get('$auth');
        var token = $auth.getToken();
        if (token) {
          config.headers.Authorization = token; //'Bearer ' + token;
        }
        return config;
      },
      response: function response(_response) {
        return _response;
      }
    };
  }]);

  function config($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider, $authProvider, API_URL, $httpProvider) {
    "ngInject";

    getCurrentUser.$inject = ["edAuthService"];
    $locationProvider.html5Mode(true);

    $authProvider.loginUrl = API_URL + 'api/login';
    $authProvider.signupUrl = API_URL + 'api/register';

    $httpProvider.interceptors.push('authInterceptor');

    $authProvider.google({
      clientId: '180115616906-3dekl0d823bbm280f1hidk1kk41cd9fl.apps.googleusercontent.com',
      url: API_URL + 'api/auth/google',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      //redirectUri: $window.location.origin,
      requiredUrlParams: ['scope'],
      optionalUrlParams: ['display'],
      scope: ['profile', 'email', 'https://gdata.youtube.com'],
      scopePrefix: 'openid',
      scopeDelimiter: ' ',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: { width: 452, height: 633 }
    });

    var originalWhen = $routeProvider.when;

    /*$routeProvider.when = function(path, route) {
      route.resolve || (route.resolve = {});
      angular.extend(route.resolve, {
        getCurrentUser: getCurrentUser
      });
       return originalWhen.call($routeProvider, path, route);
    };*/

    $routeProvider.when('/', {
      template: '<ed-home></ed-home>'
    }).when('/about', {
      template: '<ed-about></ed-about>'
    }).when('/signin', {
      template: '<ed-signin></ed-signin>'
    }).when('/signup', {
      template: '<ed-signup></ed-signup>'
    }).when('/profile', {
      template: '<ed-user-profile></ed-user-profile>'
    }).when('/admin', {
      template: '<ed-admin></ed-admin>'
    }).when('/myPlaylists', {
      template: '<ed-my-playlists></ed-my-playlists>',
      resolve: { getCurrentUser: getCurrentUser }
    }).when('/playlist/public/:id', {
      template: '<ed-playlist-player></ed-playlist-player>'
    }).otherwise({
      redirectTo: '/'
    });

    /* $mdIconProvider
        .defaultIconSet("./assets/svg/avatars.svg", 128)
        .icon("menu", "./assets/svg/menu.svg", 24) */

    $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('yellow');

    function getCurrentUser(edAuthService) {
      return edAuthService.getUser();
    }
  }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app').component('edAdmin', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/admin/admin.html');
    }],
    controller: adminCtrl
  });

  function adminCtrl() {
    "ngInject";

    var ctrl = this;
  }
})();
"use strict";

(function () {
  'use strict';

  edAuthCtrl.$inject = ["$auth", "edAuthService"];
  angular.module('app').component('edAuth', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/auth/auth.html');
    }],
    controller: edAuthCtrl
  });

  function edAuthCtrl($auth, edAuthService) {
    "ngInject";

    var ctrl = this;

    ctrl.isAuthenticated = $auth.isAuthenticated;

    ctrl.logout = edAuthService.logout;
  }
})();
"use strict";

(function () {
  'use strict';

  edAuthService.$inject = ["$rootScope", "$resource", "$auth", "edToasterService", "$location", "edErrorsService"];
  angular.module('app').service('edAuthService', edAuthService);

  function edAuthService($rootScope, $resource, $auth, edToasterService, $location, edErrorsService) {
    "ngInject";

    var service = {
      authenticate: authenticate,
      signup: signup,
      login: login,
      logout: logout,
      getUser: getUser,
      user: undefined
    };

    var userResource = $resource('/api/user/', { _id: '@_id' });

    userResource.prototype.isAdmin = function () {
      return this.roles && this.roles.indexOf('admin') > -1;
    };

    function authenticate(privider) {
      $auth.authenticate(privider).then(function (res) {
        edToasterService.showCustomToast({
          type: 'success',
          message: 'Thanks for comming ' + res.data.user.firstName + '!'
        });
        $location.path('/');
      }, edErrorsService.handleError);
    }

    function signup(user) {
      $auth.signup(user).then(function (res) {
        $auth.login(user);
        return res;
      }).then(function (res) {
        $location.path('/');
        edToasterService.showCustomToast({
          type: 'success',
          message: 'Welcome, ' + res.data.user.email + '! Please email activate your account in the next several days.'
        });
      }, edErrorsService.handleError);
    }

    function login(user) {
      $auth.login(user).then(function (res) {
        var message = 'Thanks for comming back ' + res.data.user.email + '!';
        if (!res.data.user.active) {
          message = 'Please activate your account soon!';
        }
        $location.path('/');
        edToasterService.showCustomToast({
          type: 'success',
          message: message
        });
      }, edErrorsService.handleError);
    }

    var getUserPromise = void 0;

    function getUser() {
      if ($auth.isAuthenticated()) {
        var payload = $auth.getPayload();
        var expired = payload.exp - Date.now() <= 0;
        if (expired) {
          logout();
          return Promise.reject('Authentication expired');
        } else {
          if (service.user) {
            return Promise.resolve(service.user);
          } else {
            if (getUserPromise) {
              return getUserPromise;
            } else {
              getUserPromise = userResource.get({ _id: payload.sub }).$promise.then(function (_user) {
                service.user = _user;
                userChange(_user);
                return service.user;
              }, function (err) {
                logout();
                edErrorsService.handleError(err);
              });
              return getUserPromise;
            }
          }
        }
      } else {
        return Promise.reject('User is not authenticated');
      }
    }

    function userChange(user) {
      $rootScope.$emit('edUserChange', user);
    }

    function logout() {
      $auth.logout();
      userChange();
      getUserPromise = undefined;
      service.user = undefined;
      $location.path('/');
    }

    return service;
  }
})();
"use strict";

(function () {
  'use strict';

  heroCtrl.$inject = ["edPlaylistService", "$location"];
  angular.module('app').component('edHero', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/hero/hero.html');
    }],
    controller: heroCtrl
  });

  function heroCtrl(edPlaylistService, $location) {
    "ngInject";

    var ctrl = this;

    edPlaylistService.featuredResource.get().$promise.then(function (playlists) {
      console.log(playlists);
      ctrl.featuredPlaylists = playlists;
    }, function (err) {
      console.log(err);
    });

    ctrl.goToPlaylist = function (id) {
      console.log("/playlist/public/" + id);
      $location.path("/playlist/public/" + id);
    };
  }
})();
"use strict";

(function () {
  'use strict';

  myPlaylistsCtrl.$inject = ["edAuthService", "edPlaylistService"];
  angular.module('app').component('edMyPlaylists', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/myPlaylists/myPlaylists.html');
    }],
    controller: myPlaylistsCtrl
  });

  function myPlaylistsCtrl(edAuthService, edPlaylistService) {
    "ngInject";

    var ctrl = this;

    ctrl.user = edAuthService.user;

    ctrl.groups = edAuthService.user.owner.map(function (group) {
      return { name: group };
    });

    ctrl.addPlaylist = function (newPlaylist) {
      newPlaylist.links = newPlaylist.links.split(',');
      edPlaylistService.personalResource.save(newPlaylist).$promise.then(function (something) {
        console.log(something);
      }, function (err) {
        console.log(err);
      });
    };

    ctrl.newPlaylist = {
      groups: [ctrl.groups[0].name]
    };

    edPlaylistService.personalResource.get().$promise.then(function (playlists) {
      console.log(playlists);
      ctrl.playlists = playlists;
    }, function (err) {
      console.log(err);
    });
  }
})();
"use strict";

(function () {
  'use strict';

  playlistPlayerCtrl.$inject = ["$routeParams", "edPlaylistService"];
  angular.module('app').component('edPlaylistPlayer', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/playlistPlayer/playlistPlayer.html');
    }],
    controller: playlistPlayerCtrl
  });

  function playlistPlayerCtrl($routeParams, edPlaylistService) {
    "ngInject";

    var ctrl = this;

    ctrl.id = $routeParams.id;

    edPlaylistService.publicResource.get({ _id: ctrl.id }).$promise.then(function (playlist) {
      console.log(playlist);
      ctrl.playlist = playlist;
    }, function (err) {
      console.log(err);
    });
  }
})();
'use strict';

angular.module('app').service('edPlaylistService', ["$resource", function ($resource) {
  "ngInject";

  var personalResource = $resource('/api/playlist/personal', {}, { get: { method: 'GET', isArray: true } });

  var featuredResource = $resource('/api/playlist/featured', {}, { get: { method: 'GET', isArray: true } });

  var publicResource = $resource('/api/playlist/public/', { _id: '@_id' });

  return { personalResource: personalResource, featuredResource: featuredResource, publicResource: publicResource };
}]);
'use strict';

(function () {
  'use strict';

  edErrorsService.$inject = ["edToasterService"];
  angular.module('app').service('edErrorsService', edErrorsService);

  function edErrorsService(edToasterService) {
    "ngInject";

    var service = { handleError: handleError };

    function handleError(err) {
      var message = err.data ? err.data : err.statusText;
      edToasterService.showCustomToast({
        type: 'warning',
        message: 'Something went wrong: ' + message
      });
    }

    return service;
  }
})();
'use strict';

(function () {
  'use strict';

  signinCtrl.$inject = ["edAuthService"];
  angular.module('app').component('edSignin', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/signin/signin.html');
    }],
    controller: signinCtrl
  });

  function signinCtrl(edAuthService) {
    "ngInject";

    var ctrl = this;

    ctrl.signin = function () {
      edAuthService.login(ctrl.user);
    };

    ctrl.authenticate = function (privider) {
      edAuthService.authenticate(privider);
    };
  }
})();
'use strict';

(function () {
  'use strict';

  signupCtrl.$inject = ["edAuthService"];
  angular.module('app').component('edSignup', {
    bindings: {},
    require: 'ngModel',
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/signup/signup.html');
    }],
    controller: signupCtrl
  });

  function signupCtrl(edAuthService) {
    "ngInject";

    var ctrl = this;

    ctrl.signup = function () {
      edAuthService.signup(ctrl.user);
    };

    ctrl.authenticate = function (privider) {
      edAuthService.authenticate(privider);
    };
  }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app').directive('edValidateEquals', function () {
    "ngInject";

    return {
      require: 'ngModel',
      link: function link(scope, element, attrs, ngModelCtrl) {
        function validateEqual(value) {
          var valid = value === scope.$eval(attrs.edValidateEquals);
          ngModelCtrl.$setValidity('confirmPassword', valid);
          return value;
        }

        ngModelCtrl.$parsers.push(validateEqual);
        ngModelCtrl.$formatters.push(validateEqual);

        scope.$watch(attrs.edValidateEquals, function () {
          validateEqual(scope.$eval(attrs.ngModel));
          ngModelCtrl.$setViewValue(ngModelCtrl.$viewValue);
        });
      }
    };
  });
})();
"use strict";

(function () {
  'use strict';

  edToasterCtrl.$inject = ["$window", "$mdToast", "edToasterService"];
  angular.module('app').controller('edToasterCtrl', edToasterCtrl);

  function edToasterCtrl($window, $mdToast, edToasterService) {
    "ngInject";

    var ctrl = this;

    ctrl.options = edToasterService.options;
    ctrl.closeToast = closeToast;
    ctrl.openMoreInfo = openMoreInfo;

    function closeToast() {
      if (ctrl.isDlgOpen) return;
      $mdToast.hide().then(function () {
        ctrl.isDlgOpen = false;
      });
    }

    function openMoreInfo(link) {
      $window.open(link, '_blank');
    }
  }
})();
'use strict';

(function () {
  'use strict';

  edToasterService.$inject = ["$mdToast"];
  angular.module('app').service('edToasterService', edToasterService);

  function edToasterService($mdToast) {
    "ngInject";

    var service = {
      showCustomToast: showCustomToast
    };

    function showCustomToast(opt) {
      service.options = opt;
      var delay = opt.action ? 8000 : 4000;
      $mdToast.show({
        hideDelay: delay,
        position: 'top right',
        controller: 'edToasterCtrl',
        controllerAs: '$ctrl',
        template: ['<md-toast style="z-index: 99999">', '<div class="md-toast-text toast-{{$ctrl.options.type}}" >{{$ctrl.options.message}}</div>', '<md-button ng-if="$ctrl.options.action" class="md-highlight" ng-click="$ctrl.openMoreInfo($ctrl.options.action.link)">', '<span style="color: #424242" ng-if="!$ctrl.options.action.label">Go there</span>', '<span style="color: #424242" ng-if="$ctrl.options.action.label">{{$ctrl.options.action.label}}</span>', '</md-button>', '<span flex class="flex"></span>', '<md-button style="margin-right: -13px;" class="md-icon-button" ng-click="$ctrl.closeToast()">', '<md-icon style="fill: white;" md-svg-src="front/assets/svg/close.svg"></md-icon>', '</md-button>', '</md-toast>'].join('')
      });
    }

    return service;
  }
})();
"use strict";

(function () {
  'use strict';

  toolbarMainCtrl.$inject = ["$auth", "$location"];
  angular.module('app').component('edToolbarMain', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/toolbarMain/toollbarMain.html');
    }],
    controller: toolbarMainCtrl
  });

  function toolbarMainCtrl($auth, $location) {
    "ngInject";

    var ctrl = this;
  }
})();
"use strict";

(function () {
  'use strict';

  userStatusCtrl.$inject = ["$auth", "$scope", "edAuthService", "$mdDialog", "$rootScope"];
  angular.module('app').component('edUserStatus', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/userStatus/userStatus.html');
    }],
    controller: userStatusCtrl
  });

  function userStatusCtrl($auth, $scope, edAuthService, $mdDialog, $rootScope) {
    "ngInject";

    var ctrl = this;
    ctrl.isAuthenticated = $auth.isAuthenticated;

    ctrl.getUser = function () {
      edAuthService.getUser().then(function (user) {
        ctrl.user = user;
      }, function (err) {
        console.log(err);
      });
    };

    ctrl.$onInit = function () {
      ctrl.getUser();
    };

    ctrl.logout = edAuthService.logout;

    var userCangeListener = $rootScope.$on('edUserChange', function () {
      ctrl.user = edAuthService.user;
    });

    $scope.$on('$destroy', function () {
      userCangeListener();
    });

    ctrl.openMenu = function ($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };
  }
})();
'use strict';

(function () {
  'use strict';

  userProfileCtrl.$inject = ["edAuthService"];
  angular.module('app').component('edUserProfile', {
    bindings: {},
    template: ["$templateCache", function ($templateCache) {
      "ngInject";

      return $templateCache.get('public/src/userProfile/userProfile.html');
    }],
    controller: userProfileCtrl
  });

  function userProfileCtrl(edAuthService) {
    "ngInject";

    var ctrl = this;

    ctrl.user = edAuthService.user;
    /*console.log("||||||||||||||||")
    console.log(edAuthService.user)*/

    edAuthService.getUser().then(function (user) {
      ctrl.user = user;
    });
  }
})();