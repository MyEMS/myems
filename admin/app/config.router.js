/**
 * INSPINIA - Responsive Admin Theme
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
app
    .run([
        '$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
                $rootScope.$emit('handleStateChange', toState.data.pageTitle);
            });
        }
    ])
    .config(
        [
            '$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {

                $urlRouterProvider.otherwise("login/login");

                $stateProvider
                    .state('feed', {
                        abstract: true,
                        url: "/feed",
                        templateUrl: "views/common/content.html",
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: [
                                                    'app/services/login/login.service.js',
                                                    'app/services/fdd/webmessageanalysis.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/login/login.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('fdd', {
                        abstract: true,
                        url: "/fdd",
                        templateUrl: "views/common/content.html",
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: [
                                                    'app/services/login/login.service.js',
                                                    'app/services/fdd/webmessageanalysis.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/login/login.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('fdd.rule', {
                        url: "/rule",
                        templateUrl: "views/fdd/rule.html",
                        data: {
                            pageTitle: 'MENU.FDD.RULE'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'daterangepicker', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load(
                                                [{
                                                    files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                                }, {
                                                    name: 'oitozero.ngSweetAlert',
                                                    files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                                }, {
                                                    serie: true,
                                                    files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                                }, {
                                                    name: 'daterangepicker',
                                                    files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                                }, {
                                                    files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                                }, {
                                                    name: 'ui.footable',
                                                    files: ['js/plugins/footable/angular-footable.js']
                                                }, {
                                                    serie: true,
                                                    files: [
                                                        'app/services/settings/space/space.service.js',
                                                        'app/services/settings/tenant/tenant.service.js',
                                                        'app/services/settings/store/store.service.js',
                                                        'app/services/settings/equipment/equipment.service.js',
                                                        'app/services/settings/combinedequipment/combinedequipment.service.js',
                                                        'app/services/settings/meter/meter.service.js',
                                                        'app/services/fdd/rule.service.js',
                                                        'app/controllers/fdd/rule/rule.controller.js'
                                                    ]
                                                }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('fdd.textmessage', {
                        url: "/textmessage",
                        templateUrl: "views/fdd/textmessage.html",
                        data: {
                            pageTitle: 'MENU.FDD.MESSAGEALARM'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'daterangepicker', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load(
                                                [{
                                                    files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                                }, {
                                                    name: 'oitozero.ngSweetAlert',
                                                    files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                                }, {
                                                    serie: true,
                                                    files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                                }, {
                                                    name: 'daterangepicker',
                                                    files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                                }, {
                                                    files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                                }, {
                                                    name: 'ui.footable',
                                                    files: ['js/plugins/footable/angular-footable.js']
                                                }, {
                                                    serie: true,
                                                    files: [
                                                        'app/services/fdd/textmessageanalysis.service.js',
                                                        'app/controllers/fdd/textmessage/textmessage.controller.js',
                                                        'app/controllers/fdd/textmessage/textmessagemaster.controller.js',
                                                        'app/controllers/fdd/textmessage/textmessageoption.controller.js'
                                                    ]
                                                }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('fdd.emailmessage', {
                        url: "/emailmessage",
                        templateUrl: "views/fdd/emailmessage.html",
                        data: {
                            pageTitle: 'MENU.FDD.EMAILALARM'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'daterangepicker', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load(
                                                [{
                                                    files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                                }, {
                                                    name: 'oitozero.ngSweetAlert',
                                                    files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                                }, {
                                                    serie: true,
                                                    files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                                }, {
                                                    name: 'daterangepicker',
                                                    files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                                }, {
                                                    files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                                }, {
                                                    name: 'ui.footable',
                                                    files: ['js/plugins/footable/angular-footable.js']
                                                }, {
                                                    serie: true,
                                                    files: [
                                                        'app/services/fdd/emailmessageanalysis.service.js',
                                                        'app/controllers/fdd/emailmessage/emailmessage.controller.js',
                                                        'app/controllers/fdd/emailmessage/emailmessagemaster.controller.js',
                                                        'app/controllers/fdd/emailmessage/emailmessageoption.controller.js'
                                                    ]
                                                }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('fdd.webmessage', {
                        url: "/webmessage",
                        templateUrl: "views/fdd/webmessage.html",
                        data: {
                            pageTitle: 'MENU.FDD.WEBALARM'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'daterangepicker', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load(
                                                [{
                                                    files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                                }, {
                                                    name: 'oitozero.ngSweetAlert',
                                                    files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                                }, {
                                                    serie: true,
                                                    files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                                }, {
                                                    name: 'daterangepicker',
                                                    files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                                }, {
                                                    files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                                }, {
                                                    name: 'ui.footable',
                                                    files: ['js/plugins/footable/angular-footable.js']
                                                }, {
                                                    serie: true,
                                                    files: [
                                                        'app/services/fdd/webmessageanalysis.service.js',
                                                        'app/controllers/fdd/webmessage/webmessage.controller.js',
                                                        'app/controllers/fdd/webmessage/webmessagemaster.controller.js',
                                                        'app/controllers/fdd/webmessage/webmessageoption.controller.js'
                                                    ]
                                                }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('fdd.wechatmessage', {
                        url: "/wechatmessage",
                        templateUrl: "views/fdd/wechatmessage.html",
                        data: {
                            pageTitle: 'MENU.FDD.WECHATALARM'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'daterangepicker', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load(
                                                [{
                                                    files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                                }, {
                                                    name: 'oitozero.ngSweetAlert',
                                                    files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                                }, {
                                                    serie: true,
                                                    files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                                }, {
                                                    name: 'daterangepicker',
                                                    files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                                }, {
                                                    files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                                }, {
                                                    name: 'ui.footable',
                                                    files: ['js/plugins/footable/angular-footable.js']
                                                }, {
                                                    serie: true,
                                                    files: [
                                                        'app/services/fdd/wechatmessageanalysis.service.js',
                                                        'app/controllers/fdd/wechatmessage/wechatmessage.controller.js',
                                                        'app/controllers/fdd/wechatmessage/wechatmessagemaster.controller.js',
                                                        'app/controllers/fdd/wechatmessage/wechatmessageoption.controller.js'
                                                    ]
                                                }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('equipment', {
                        abstract: true,
                        url: "/equipment",
                        templateUrl: "views/common/content.html",
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: [
                                                    'app/services/login/login.service.js',
                                                    'app/services/fdd/webmessageanalysis.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/login/login.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('combinedequipment', {
                        abstract: true,
                        url: "/combinedequipment",
                        templateUrl: "views/common/content.html",
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: [
                                                    'app/services/login/login.service.js',
                                                    'app/services/fdd/webmessageanalysis.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/login/login.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('verification', {
                        abstract: true,
                        url: "/verification",
                        templateUrl: "views/common/content.html",
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: [
                                                    'app/services/login/login.service.js',
                                                    'app/services/fdd/webmessageanalysis.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/login/login.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings', {
                        abstract: true,
                        url: "/settings",
                        templateUrl: "views/common/content.html",
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: [
                                                    'app/services/login/login.service.js',
                                                    'app/services/fdd/webmessageanalysis.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/login/login.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.space', {
                        url: "/space",
                        templateUrl: "views/settings/space/space.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.SPACE',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/space/space.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/virtual-meter.service.js',
                                                    'app/services/settings/meter/offline-meter.service.js',
                                                    'app/services/settings/equipment/equipment.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipment.service.js',
                                                    'app/services/settings/tenant/tenant.service.js',
                                                    'app/services/settings/store/store.service.js',
                                                    'app/services/settings/shopfloor/shopfloor.service.js',
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/services/settings/space/spacemeter.service.js',
                                                    'app/services/settings/space/spaceequipment.service.js',
                                                    'app/services/settings/space/spacecombinedequipment.service.js',
                                                    'app/services/settings/space/spacetenant.service.js',
                                                    'app/services/settings/space/spacestore.service.js',
                                                    'app/services/settings/space/spaceshopfloor.service.js',
                                                    'app/services/settings/space/spacepoint.service.js',
                                                    'app/services/settings/space/spacesensor.service.js',
                                                    'app/controllers/settings/space/space.controller.js',
                                                    'app/controllers/settings/space/spacemeter.controller.js',
                                                    'app/controllers/settings/space/spaceequipment.controller.js',
                                                    'app/controllers/settings/space/spacecombinedequipment.controller.js',
                                                    'app/controllers/settings/space/spacetenant.controller.js',
                                                    'app/controllers/settings/space/spacestore.controller.js',
                                                    'app/controllers/settings/space/spaceshopfloor.controller.js',
                                                    'app/controllers/settings/space/spacepoint.controller.js',
                                                    'app/controllers/settings/space/spacesensor.controller.js',
                                                    'app/controllers/settings/space/space.master.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.tenant', {
                        url: "/tenant",
                        templateUrl: "views/settings/tenant/tenant.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.TENANT',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                            }, {
                                                name: 'daterangepicker',
                                                files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                            }, {
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                name: 'daterangepicker',
                                                files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/tenant/tenant.service.js',
                                                    'app/services/settings/tenant/tenanttype.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/virtual-meter.service.js',
                                                    'app/services/settings/meter/offline-meter.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/tenant/tenantmeter.service.js',
                                                    'app/services/settings/tenant/tenantpoint.service.js',
                                                    'app/services/settings/tenant/tenantsensor.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/controllers/settings/tenant/tenant.master.controller.js',
                                                    'app/controllers/settings/tenant/tenant.controller.js',
                                                    'app/controllers/settings/tenant/tenantmeter.controller.js',
                                                    'app/controllers/settings/tenant/tenantpoint.controller.js',
                                                    'app/controllers/settings/tenant/tenantsensor.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.store', {
                        url: "/store",
                        templateUrl: "views/settings/store/store.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.STORE',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                            }, {
                                                name: 'daterangepicker',
                                                files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                            }, {
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                name: 'daterangepicker',
                                                files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/store/store.service.js',
                                                    'app/services/settings/store/storetype.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/virtual-meter.service.js',
                                                    'app/services/settings/meter/offline-meter.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/store/storemeter.service.js',
                                                    'app/services/settings/store/storepoint.service.js',
                                                    'app/services/settings/store/storesensor.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/controllers/settings/store/store.master.controller.js',
                                                    'app/controllers/settings/store/store.controller.js',
                                                    'app/controllers/settings/store/storemeter.controller.js',
                                                    'app/controllers/settings/store/storepoint.controller.js',
                                                    'app/controllers/settings/store/storesensor.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.shopfloor', {
                        url: "/shopfloor",
                        templateUrl: "views/settings/shopfloor/shopfloor.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.SHOPFLOOR',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                            }, {
                                                name: 'daterangepicker',
                                                files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                            }, {
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                name: 'daterangepicker',
                                                files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/shopfloor/shopfloor.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/virtual-meter.service.js',
                                                    'app/services/settings/meter/offline-meter.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/shopfloor/shopfloorequipment.service.js',
                                                    'app/services/settings/shopfloor/shopfloormeter.service.js',
                                                    'app/services/settings/shopfloor/shopfloorpoint.service.js',
                                                    'app/services/settings/shopfloor/shopfloorsensor.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/equipment/equipment.service.js',
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/controllers/settings/shopfloor/shopfloor.master.controller.js',
                                                    'app/controllers/settings/shopfloor/shopfloor.controller.js',
                                                    'app/controllers/settings/shopfloor/shopfloorequipment.controller.js',
                                                    'app/controllers/settings/shopfloor/shopfloormeter.controller.js',
                                                    'app/controllers/settings/shopfloor/shopfloorpoint.controller.js',
                                                    'app/controllers/settings/shopfloor/shopfloorsensor.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.equipment', {
                        url: "/equipment",
                        templateUrl: "views/settings/equipment/equipment.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.EQUIPMENT'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/space/space.service.js',
                                                    'app/services/settings/equipment/equipment.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/offline-meter.service.js',
                                                    'app/services/settings/meter/virtual-meter.service.js',
                                                    'app/services/settings/equipment/equipmentmeter.service.js',
                                                    'app/services/settings/equipment/equipmentparameter.service.js',
                                                    'app/controllers/settings/equipment/equipment.master.controller.js',
                                                    'app/controllers/settings/equipment/equipment.controller.js',
                                                    'app/controllers/settings/equipment/equipmentmeter.controller.js',
                                                    'app/controllers/settings/equipment/equipmentparameter.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.combinedequipment', {
                        url: "/combinedequipment",
                        templateUrl: "views/settings/combinedequipment/combinedequipment.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.COMBINED_EQUIPMENT'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/space/space.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipment.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/equipment/equipment.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/offline-meter.service.js',
                                                    'app/services/settings/meter/virtual-meter.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipmentequipment.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipmentmeter.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipmentparameter.service.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipment.master.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipment.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipmentequipment.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipmentmeter.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipmentparameter.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.meter', {
                        url: "/meter",
                        templateUrl: "views/settings/meter/meter.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.METER',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/category/category.service.js',
                                                    'app/services/settings/category/energyitem.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/offline-meter.service.js',
                                                    'app/services/settings/meter/offline-meter-file.service.js',
                                                    'app/services/settings/meter/virtual-meter.service.js',
                                                    'app/services/settings/meter/meterpoint.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/controllers/settings/meter/meter.master.controller.js',
                                                    'app/controllers/settings/meter/meter.controller.js',
                                                    'app/controllers/settings/meter/offline-meter.controller.js',
                                                    'app/controllers/settings/meter/offline-meter-file.controller.js',
                                                    'app/controllers/settings/meter/virtual-meter.controller.js',
                                                    'app/controllers/settings/meter/meterpoint.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.sensor', {
                        url: "/sensor",
                        templateUrl: "views/settings/sensor/sensor.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.SENSOR',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/services/settings/sensor/sensorpoint.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/controllers/settings/sensor/sensor.master.controller.js',
                                                    'app/controllers/settings/sensor/sensor.controller.js',
                                                    'app/controllers/settings/sensor/sensorpoint.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.costcenter', {
                        url: "/costcenter",
                        templateUrl: "views/settings/costcenter/costcenter.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.COSTCENTER',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/costcenter/costcentertariff.service.js',
                                                    'app/services/settings/tariff/tariff.service.js',
                                                    'app/services/settings/costcenter/cost-file.service.js',
                                                    'app/controllers/settings/costcenter/costcenter.master.controller.js',
                                                    'app/controllers/settings/costcenter/costcenter.controller.js',
                                                    'app/controllers/settings/costcenter/costcentertariff.controller.js',
                                                    'app/controllers/settings/costcenter/cost-file.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.datasource', {
                        url: "/data-source",
                        templateUrl: "views/settings/datasource/datasource.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.DATASOURCE'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {

                                                files: [
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/gateway/gateway.service.js',
                                                    'app/controllers/settings/datasource/datasource.master.controller.js',
                                                    'app/controllers/settings/datasource/datasource.controller.js',
                                                    'app/controllers/settings/datasource/point.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.category', {
                        url: "/category",
                        templateUrl: "views/settings/category/category.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.CATEGORY'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/category/category.service.js',
                                                    'app/controllers/settings/category/energycategory.master.controller.js',
                                                    'app/controllers/settings/category/energycategory.controller.js',
                                                    'app/services/settings/category/energyitem.service.js',
                                                    'app/controllers/settings/category/energyitem.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.energyflowdiagram', {
                        url: "/energyflowdiagram",
                        templateUrl: "views/settings/energyflowdiagram/energyflowdiagram.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.ENERGY_FLOW_DIAGRAM'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/energyflowdiagram/energyflowdiagram.service.js',
                                                    'app/services/settings/energyflowdiagram/energyflowdiagramnode.service.js',
                                                    'app/services/settings/energyflowdiagram/energyflowdiagramlink.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/offline-meter.service.js',
                                                    'app/services/settings/meter/virtual-meter.service.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagram.master.controller.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagram.controller.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagramnode.controller.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagramlink.controller.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagrampreview.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.distributionsystem', {
                        url: "/distributionsystem",
                        templateUrl: "views/settings/distributionsystem/distributionsystem.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.DISTRIBUTION_SYSTEM'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.checkbox', 'ui.select', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/distributionsystem/distributionsystem.service.js',
                                                    'app/services/settings/distributionsystem/distributioncircuit.service.js',
                                                    'app/services/settings/distributionsystem/distributioncircuitpoint.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/controllers/settings/distributionsystem/distributionsystem.master.controller.js',
                                                    'app/controllers/settings/distributionsystem/distributionsystem.controller.js',
                                                    'app/controllers/settings/distributionsystem/distributioncircuit.controller.js',
                                                    'app/controllers/settings/distributionsystem/distributioncircuitpoint.controller.js',
                                                    'app/controllers/settings/distributionsystem/distributionsystempreview.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.contact', {
                        url: "/contact",
                        templateUrl: "views/settings/contact/contact.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.CONTACT'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/controllers/settings/contact/contact.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.emailserver', {
                        url: "/emailserver",
                        templateUrl: "views/settings/emailserver/emailserver.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.EMAIL_SERVER'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/emailserver/emailserver.service.js',
                                                    'app/controllers/settings/emailserver/emailserver.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })

                    .state('settings.gateway', {
                        url: "/gateway",
                        templateUrl: "views/settings/gateway/gateway.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.GATEWAY',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/gateway/gateway.service.js',
                                                    'app/controllers/settings/gateway/gateway.master.controller.js',
                                                    'app/controllers/settings/gateway/gateway.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.gsmmodem', {
                        url: "/gsmmodem",
                        templateUrl: "views/settings/gsmmodem/gsmmodem.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.GSM_MODEM'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/gsmmodem/gsmmodem.service.js',
                                                    'app/controllers/settings/gsmmodem/gsmmodem.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.knowledgefile', {
                        url: "/knowledgefile",
                        templateUrl: "views/settings/knowledgefile/knowledgefile.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.KNOWLEDGEFILE',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/knowledgefile/knowledgefile.service.js',
                                                    'app/controllers/settings/knowledgefile/knowledgefile.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.tariff', {
                        url: "/tariff",
                        templateUrl: "views/settings/tariff/tariff.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.TARIFF'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: ['js/daterangepicker/daterangepicker.min.js', 'js/daterangepicker/daterangepicker.min.css']
                                            }, {
                                                name: 'daterangepicker',
                                                files: ['js/daterangepicker/angular-daterangepicker.min.js']
                                            }, {
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/tariff/tariff.service.js',
                                                    'app/services/settings/tariff/tariff.const.js',
                                                    'app/services/settings/category/category.service.js',
                                                    'app/controllers/settings/tariff/tariff.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('users', {
                        abstract: true,
                        url: "/users",
                        templateUrl: "views/common/content.html",
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: [
                                                    'app/services/login/login.service.js',
                                                    'app/services/fdd/webmessageanalysis.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/login/login.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('users.user', {
                        url: "/user",
                        templateUrl: "views/users/user/user.html",
                        data: {
                            pageTitle: 'MENU.USERSETTING.USER'

                        },

                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/users/user/user.service.js',
                                                    'app/services/users/privilege/privilege.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('users.privilege', {
                        url: "/privilege",
                        templateUrl: "views/users/privilege/privilege.html",
                        data: {
                            pageTitle: 'MENU.USERSETTING.PRIVILEGE'
                        },

                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'toaster', 'integralui']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/users/user/user.service.js',
                                                    'app/services/users/privilege/privilege.service.js',
                                                    'app/services/settings/space/space.service.js',
                                                    'app/controllers/users/privilege/privilege.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('login', {
                        abstract: true,
                        url: "/login",
                        templateUrl: "views/common/content_top_login_navigation.html",
                    })
                    .state('login.login', {
                        url: "/login",
                        templateUrl: "views/login/login.html",
                        data: {
                            pageTitle: 'MY_EMS_NAME',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                serie: true,
                                                files: [
                                                    'app/services/login/login.service.js',
                                                    'app/services/fdd/webmessageanalysis.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/login/login.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    });

            }
        ]
    );
