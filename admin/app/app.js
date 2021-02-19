/**
 * INSPINIA - Responsive Admin Theme
 *
 */
(function () {
    angular.module('inspinia', [
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
        'pascalprecht.translate',       // Angular Translate
        'ngIdle',                       // Idle timer
        'ngSanitize',                    // ngSanitize
        'highcharts-ng',
        'ngCookies',
        //'ngDragDrop',
        'hjc.directives.dragdrop',
        'angular-loading-bar',
        'nvd3',
        'thatisuday.dropzone'
    ])
})();

// Other libraries are loaded dynamically in the config.js file using the library ocLazyLoad