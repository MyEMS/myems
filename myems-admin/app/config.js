var app =
    angular.module('inspinia')
        .config(
        [
            '$controllerProvider', '$compileProvider', '$filterProvider', '$provide','$httpProvider','$cookiesProvider',
            function($controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider,$cookiesProvider) {
                app.controller = $controllerProvider.register;
                app.directive = $compileProvider.directive;
                app.filter = $filterProvider.register;
                app.factory = $provide.factory;
                app.service = $provide.service;
                app.constant = $provide.constant;
                app.value = $provide.value;
                $httpProvider.defaults.withCredentials = true;
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
                $cookiesProvider.defaults.domain=getAPI();

            }
        ]);
//