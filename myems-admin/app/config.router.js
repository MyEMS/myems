app
    .run([
        '$rootScope', '$state', '$transitions', '$location', '$window',
        function ($rootScope, $state, $transitions, $location, $window) {
            $rootScope.$state = $state;
            $transitions.onStart( { }, function(trans) {
                if ($location.$$path.indexOf('login')==-1) {
                    if ($window.localStorage.getItem("myems_admin_ui_current_user")){
                        currentUser = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
                    }
                    if (currentUser == undefined || currentUser.is_admin === false) {
                        $window.localStorage.removeItem("myems_admin_ui_current_user");
                        return $state.target("login.login");
                    } else {
                        $rootScope.pageTitle = trans.to().data.pageTitle;
                        return undefined;
                    }
                }
              });
        }
    ])
    .config(
        [
            '$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {

                $urlRouterProvider.otherwise("login/login");

                $stateProvider
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
                                                    'app/services/fdd/webmessage.service.js',
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
                                                        'app/controllers/fdd/rule/rule.controller.js',
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
                                                        'app/services/fdd/textmessage.service.js',
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
                                                        'app/services/fdd/emailmessage.service.js',
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
                                                        'app/services/fdd/webmessage.service.js',
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
                                                        'app/services/fdd/wechatmessage.service.js',
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
                                                    'app/services/fdd/webmessage.service.js',
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
                                            },{
                                                files: ['js/plugins/footable/footable.all.min.js',
                                                    'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
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
                                                    'app/controllers/settings/category/energyitem.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                            },{
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/costcenter/costcentertariff.service.js',
                                                    'app/services/settings/tariff/tariff.service.js',
                                                    'app/services/settings/costcenter/costfile.service.js',
                                                    'app/controllers/settings/costcenter/costcenter.master.controller.js',
                                                    'app/controllers/settings/costcenter/costcenter.controller.js',
                                                    'app/controllers/settings/costcenter/costcentertariff.controller.js',
                                                    'app/controllers/settings/costcenter/costfile.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.command', {
                        url: "/command",
                        templateUrl: "views/settings/command/command.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.COMMAND'
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/command/command.service.js',
                                                    'app/controllers/settings/command/command.master.controller.js',
                                                    'app/controllers/settings/command/command.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                    return $ocLazyLoad.load(['ui.select', 'daterangepicker', 'toaster']).then(
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
                                                    'app/controllers/settings/tariff/tariff.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/controllers/settings/contact/contact.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.controlmode', {
                        url: "/controlmode",
                        templateUrl: "views/settings/controlmode/controlmode.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.CONTROL_MODE'
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'daterangepicker', 'toaster']).then(
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
                                                    'app/services/settings/controlmode/controlmode.service.js',
                                                    'app/controllers/settings/controlmode/controlmode.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.iotsimcard', {
                        url: "/iotsimcard",
                        templateUrl: "views/settings/iotsimcard/iotsimcard.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.IOTSIMCARD',
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
                                            },{
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/iotsimcard/iotsimcard.service.js',
                                                    'app/controllers/settings/iotsimcard/iotsimcard.master.controller.js',
                                                    'app/controllers/settings/iotsimcard/iotsimcard.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.protocol', {
                        url: "/protocol",
                        templateUrl: "views/settings/protocol/protocol.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.PROTOCOL',
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
                                                    'app/services/settings/protocol/protocol.service.js',
                                                    'app/controllers/settings/protocol/protocol.master.controller.js',
                                                    'app/controllers/settings/protocol/protocol.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {

                                                files: [
                                                    'app/services/settings/datasource/datarepairfile.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/gateway/gateway.service.js',
                                                    'app/services/settings/protocol/protocol.service.js',
                                                    'app/controllers/settings/datasource/datarepairfile.controller.js',
                                                    'app/controllers/settings/datasource/datasource.master.controller.js',
                                                    'app/controllers/settings/datasource/datasource.controller.js',
                                                    'app/controllers/settings/datasource/point.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js'
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
                                                    'app/services/settings/meter/offlinemeter.service.js',
                                                    'app/services/settings/meter/offlinemeterfile.service.js',
                                                    'app/services/settings/meter/virtualmeter.service.js',
                                                    'app/services/settings/meter/meterpoint.service.js',
                                                    'app/services/settings/meter/metercommand.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/dragdropwarning.service.js',
                                                    'app/controllers/settings/meter/meter.master.controller.js',
                                                    'app/controllers/settings/meter/meter.controller.js',
                                                    'app/controllers/settings/meter/offlinemeter.controller.js',
                                                    'app/controllers/settings/meter/offlinemeterfile.controller.js',
                                                    'app/controllers/settings/meter/virtualmeter.controller.js',
                                                    'app/controllers/settings/meter/meterpoint.controller.js',
                                                    'app/controllers/settings/meter/metercommand.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                                    'app/services/dragdropwarning.service.js',
                                                    'app/controllers/settings/sensor/sensor.master.controller.js',
                                                    'app/controllers/settings/sensor/sensor.controller.js',
                                                    'app/controllers/settings/sensor/sensorpoint.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js'
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/space/space.service.js',
                                                    'app/services/settings/equipment/equipment.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/settings/meter/offlinemeter.service.js',
                                                    'app/services/settings/meter/virtualmeter.service.js',
                                                    'app/services/settings/equipment/equipmentmeter.service.js',
                                                    'app/services/settings/equipment/equipmentdatasource.service.js',
                                                    'app/services/settings/equipment/equipmentparameter.service.js',
                                                    'app/services/settings/equipment/equipmentcommand.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/dragdropwarning.service.js',
                                                    'app/controllers/settings/equipment/equipment.master.controller.js',
                                                    'app/controllers/settings/equipment/equipment.controller.js',
                                                    'app/controllers/settings/equipment/equipmentmeter.controller.js',
                                                    'app/controllers/settings/equipment/equipmentdatasource.controller.js',
                                                    'app/controllers/settings/equipment/equipmentparameter.controller.js',
                                                    'app/controllers/settings/equipment/equipmentcommand.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/space/space.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipment.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/services/settings/equipment/equipment.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/settings/meter/offlinemeter.service.js',
                                                    'app/services/settings/meter/virtualmeter.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipmentequipment.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipmentmeter.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipmentparameter.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipmentdatasource.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipmentcommand.service.js',
                                                    'app/services/dragdropwarning.service.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipment.master.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipment.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipmentequipment.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipmentmeter.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipmentparameter.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipmentdatasource.controller.js',
                                                    'app/controllers/settings/combinedequipment/combinedequipmentcommand.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster', 'datepicker']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/sweetalert/sweetalert.min.js','css/plugins/sweetalert/sweetalert.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                                            }, {
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/space/space.service.js',
                                                    'app/services/settings/microgrid/microgrid.service.js',
                                                    'app/services/settings/photovoltaicpowerstation/photovoltaicpowerstation.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/virtualmeter.service.js',
                                                    'app/services/settings/meter/offlinemeter.service.js',
                                                    'app/services/settings/equipment/equipment.service.js',
                                                    'app/services/settings/combinedequipment/combinedequipment.service.js',
                                                    'app/services/settings/distributionsystem/distributionsystem.service.js',
                                                    'app/services/settings/energyflowdiagram/energyflowdiagram.service.js',
                                                    'app/services/settings/energystoragepowerstation/energystoragepowerstation.service.js',
                                                    'app/services/settings/tenant/tenant.service.js',
                                                    'app/services/settings/store/store.service.js',
                                                    'app/services/settings/shopfloor/shopfloor.service.js',
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/services/settings/workingcalendar/workingcalendar.service.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/dragdropwarning.service.js',
                                                    'app/services/settings/space/spacecombinedequipment.service.js',
                                                    'app/services/settings/space/spacecommand.service.js',
                                                    'app/services/settings/space/spacedistributionsystem.service.js',
                                                    'app/services/settings/space/spaceenergyflowdiagram.service.js',
                                                    'app/services/settings/space/spaceenergystoragepowerstation.service.js',
                                                    'app/services/settings/space/spaceequipment.service.js',
                                                    'app/services/settings/space/spacemeter.service.js',
                                                    'app/services/settings/space/spacephotovoltaicpowerstation.service.js',
                                                    'app/services/settings/space/spacepoint.service.js',
                                                    'app/services/settings/space/spacestore.service.js',
                                                    'app/services/settings/space/spaceshopfloor.service.js',
                                                    'app/services/settings/space/spacesensor.service.js',
                                                    'app/services/settings/space/spacetenant.service.js',
                                                    'app/services/settings/space/spaceworkingcalendar.service.js',
                                                    'app/services/settings/space/spacemicrogrid.service.js',
                                                    'app/controllers/settings/space/space.controller.js',
                                                    'app/controllers/settings/space/space.master.controller.js',
                                                    'app/controllers/settings/space/spacecombinedequipment.controller.js',
                                                    'app/controllers/settings/space/spacecommand.controller.js',
                                                    'app/controllers/settings/space/spacedistributionsystem.controller.js',
                                                    'app/controllers/settings/space/spaceenergyflowdiagram.controller.js',
                                                    'app/controllers/settings/space/spaceenergystoragepowerstation.controller.js',
                                                    'app/controllers/settings/space/spaceequipment.controller.js',
                                                    'app/controllers/settings/space/spacemeter.controller.js',
                                                    'app/controllers/settings/space/spacephotovoltaicpowerstation.controller.js',
                                                    'app/controllers/settings/space/spacepoint.controller.js',
                                                    'app/controllers/settings/space/spacestore.controller.js',
                                                    'app/controllers/settings/space/spaceshopfloor.controller.js',
                                                    'app/controllers/settings/space/spacesensor.controller.js',
                                                    'app/controllers/settings/space/spacetenant.controller.js',
                                                    'app/controllers/settings/space/spaceworkingcalendar.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                    'app/controllers/settings/space/spacemicrogrid.controller.js',
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
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster', ]).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/tenant/tenant.service.js',
                                                    'app/services/settings/tenant/tenanttype.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/settings/meter/virtualmeter.service.js',
                                                    'app/services/settings/meter/offlinemeter.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/dragdropwarning.service.js',
                                                    'app/services/settings/tenant/tenantmeter.service.js',
                                                    'app/services/settings/tenant/tenantpoint.service.js',
                                                    'app/services/settings/tenant/tenantsensor.service.js',
                                                    'app/services/settings/tenant/tenantworkingcalendar.service.js',
                                                    'app/services/settings/tenant/tenantcommand.service.js',
                                                    'app/services/settings/workingcalendar/workingcalendar.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/controllers/settings/tenant/tenant.master.controller.js',
                                                    'app/controllers/settings/tenant/tenant.controller.js',
                                                    'app/controllers/settings/tenant/tenanttype.controller.js',
                                                    'app/controllers/settings/tenant/tenantmeter.controller.js',
                                                    'app/controllers/settings/tenant/tenantpoint.controller.js',
                                                    'app/controllers/settings/tenant/tenantsensor.controller.js',
                                                    'app/controllers/settings/tenant/tenantworkingcalendar.controller.js',
                                                    'app/controllers/settings/tenant/tenantcommand.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/store/store.service.js',
                                                    'app/services/settings/store/storetype.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/settings/meter/virtualmeter.service.js',
                                                    'app/services/settings/meter/offlinemeter.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/dragdropwarning.service.js',
                                                    'app/services/settings/store/storemeter.service.js',
                                                    'app/services/settings/store/storepoint.service.js',
                                                    'app/services/settings/store/storesensor.service.js',
                                                    'app/services/settings/store/storeworkingcalendar.service.js',
                                                    'app/services/settings/store/storecommand.service.js',
                                                    'app/services/settings/workingcalendar/workingcalendar.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/controllers/settings/store/store.master.controller.js',
                                                    'app/controllers/settings/store/store.controller.js',
                                                    'app/controllers/settings/store/storetype.controller.js',
                                                    'app/controllers/settings/store/storemeter.controller.js',
                                                    'app/controllers/settings/store/storepoint.controller.js',
                                                    'app/controllers/settings/store/storesensor.controller.js',
                                                    'app/controllers/settings/store/storeworkingcalendar.controller.js',
                                                    'app/controllers/settings/store/storecommand.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/shopfloor/shopfloor.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/settings/meter/virtualmeter.service.js',
                                                    'app/services/settings/meter/offlinemeter.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/dragdropwarning.service.js',
                                                    'app/services/settings/shopfloor/shopfloorequipment.service.js',
                                                    'app/services/settings/shopfloor/shopfloormeter.service.js',
                                                    'app/services/settings/shopfloor/shopfloorpoint.service.js',
                                                    'app/services/settings/shopfloor/shopfloorsensor.service.js',
                                                    'app/services/settings/shopfloor/shopfloorworkingcalendar.service.js',
                                                    'app/services/settings/shopfloor/shopfloorcommand.service.js',
                                                    'app/services/settings/workingcalendar/workingcalendar.service.js',
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
                                                    'app/controllers/settings/shopfloor/shopfloorworkingcalendar.controller.js',
                                                    'app/controllers/settings/shopfloor/shopfloorcommand.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.svg', {
                        url: "/svg",
                        templateUrl: "views/settings/svg/svg.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.SVG'
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/controllers/settings/svg/svg.master.controller.js',
                                                    'app/controllers/settings/svg/svg.controller.js',
                                                    'app/controllers/settings/svg/svgpreview.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/energyflowdiagram/energyflowdiagram.service.js',
                                                    'app/services/settings/energyflowdiagram/energyflowdiagramnode.service.js',
                                                    'app/services/settings/energyflowdiagram/energyflowdiagramlink.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/meter/offlinemeter.service.js',
                                                    'app/services/settings/meter/virtualmeter.service.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagram.master.controller.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagram.controller.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagramnode.controller.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagramlink.controller.js',
                                                    'app/controllers/settings/energyflowdiagram/energyflowdiagrampreview.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/distributionsystem/distributionsystem.service.js',
                                                    'app/services/settings/distributionsystem/distributioncircuit.service.js',
                                                    'app/services/settings/distributionsystem/distributioncircuitpoint.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/controllers/settings/distributionsystem/distributionsystem.master.controller.js',
                                                    'app/controllers/settings/distributionsystem/distributionsystem.controller.js',
                                                    'app/controllers/settings/distributionsystem/distributioncircuit.controller.js',
                                                    'app/controllers/settings/distributionsystem/distributioncircuitpoint.controller.js',
                                                    'app/controllers/settings/distributionsystem/distributionsystempreview.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('settings.microgrid', {
                        url: "/microgrid",
                        templateUrl: "views/settings/microgrid/microgrid.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.MICROGRID',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/microgrid/microgrid.service.js',
                                                    'app/services/settings/microgrid/microgridbattery.service.js',
                                                    'app/services/settings/microgrid/microgridevcharger.service.js',
                                                    'app/services/settings/microgrid/microgridgenerator.service.js',
                                                    'app/services/settings/microgrid/microgridgrid.service.js',
                                                    'app/services/settings/microgrid/microgridheatpump.service.js',
                                                    'app/services/settings/microgrid/microgridload.service.js',
                                                    'app/services/settings/microgrid/microgridphotovoltaic.service.js',
                                                    'app/services/settings/microgrid/microgridpowerconversionsystem.service.js',
                                                    'app/services/settings/microgrid/microgridsensor.service.js',
                                                    'app/services/settings/microgrid/microgriduser.service.js',
                                                    'app/services/settings/microgrid/microgriddatasource.service.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/sensor/sensor.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/controllers/settings/microgrid/microgrid.master.controller.js',
                                                    'app/controllers/settings/microgrid/microgrid.controller.js',
                                                    'app/controllers/settings/microgrid/microgridbattery.controller.js',
                                                    'app/controllers/settings/microgrid/microgridevcharger.controller.js',
                                                    'app/controllers/settings/microgrid/microgridgenerator.controller.js',
                                                    'app/controllers/settings/microgrid/microgridgrid.controller.js',
                                                    'app/controllers/settings/microgrid/microgridheatpump.controller.js',
                                                    'app/controllers/settings/microgrid/microgridload.controller.js',
                                                    'app/controllers/settings/microgrid/microgridphotovoltaic.controller.js',
                                                    'app/controllers/settings/microgrid/microgridpowerconversionsystem.controller.js',
                                                    'app/controllers/settings/microgrid/microgridsensor.controller.js',
                                                    'app/controllers/settings/microgrid/microgriduser.controller.js',
                                                    'app/controllers/settings/microgrid/microgriddatasource.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.virtualpowerplant', {
                        url: "/virtualpowerplant",
                        templateUrl: "views/settings/virtualpowerplant/virtualpowerplant.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.VIRTUAL_POWER_PLANT',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/virtualpowerplant/virtualpowerplant.service.js',
                                                    'app/services/settings/virtualpowerplant/virtualpowerplantmicrogrid.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/services/settings/microgrid/microgrid.service.js',
                                                    'app/controllers/settings/virtualpowerplant/virtualpowerplant.master.controller.js',
                                                    'app/controllers/settings/virtualpowerplant/virtualpowerplant.controller.js',
                                                    'app/controllers/settings/virtualpowerplant/virtualpowerplantmicrogrid.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.energystoragecontainer', {
                        url: "/energystoragecontainer",
                        templateUrl: "views/settings/energystoragecontainer/energystoragecontainer.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.ENERGY_STORAGE_CONTAINER',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/energystoragecontainer/energystoragecontainer.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainerbattery.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainercommand.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainerdatasource.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainerdcdc.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainerfirecontrol.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainergrid.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainerhvac.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainerload.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainerpowerconversionsystem.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainerschedule.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainersts.service.js',
                                                    'app/services/settings/tariff/tariff.const.js',
                                                    'app/services/settings/command/command.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainer.master.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainer.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainerbattery.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainercommand.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainerdatasource.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainerdcdc.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainerfirecontrol.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainergrid.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainerhvac.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainerload.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainerpowerconversionsystem.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainerschedule.controller.js',
                                                    'app/controllers/settings/energystoragecontainer/energystoragecontainersts.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.energystoragepowerstation', {
                        url: "/energystoragepowerstation",
                        templateUrl: "views/settings/energystoragepowerstation/energystoragepowerstation.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.ENERGY_STORAGE_POWER_STATION',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/energystoragepowerstation/energystoragepowerstation.service.js',
                                                    'app/services/settings/energystoragepowerstation/energystoragepowerstationcontainer.service.js',
                                                    'app/services/settings/energystoragepowerstation/energystoragepowerstationuser.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/energystoragecontainer/energystoragecontainer.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/settings/energystoragepowerstation/energystoragepowerstation.master.controller.js',
                                                    'app/controllers/settings/energystoragepowerstation/energystoragepowerstation.controller.js',
                                                    'app/controllers/settings/energystoragepowerstation/energystoragepowerstationcontainer.controller.js',
                                                    'app/controllers/settings/energystoragepowerstation/energystoragepowerstationuser.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.photovoltaicpowerstation', {
                        url: "/photovoltaicpowerstation",
                        templateUrl: "views/settings/photovoltaicpowerstation/photovoltaicpowerstation.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.PHOTOVOLTAIC_POWER_STATION',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/photovoltaicpowerstation/photovoltaicpowerstation.service.js',
                                                    'app/services/settings/photovoltaicpowerstation/photovoltaicpowerstationinvertor.service.js',
                                                    'app/services/settings/photovoltaicpowerstation/photovoltaicpowerstationgrid.service.js',
                                                    'app/services/settings/photovoltaicpowerstation/photovoltaicpowerstationload.service.js',
                                                    'app/services/settings/photovoltaicpowerstation/photovoltaicpowerstationuser.service.js',
                                                    'app/services/settings/photovoltaicpowerstation/photovoltaicpowerstationdatasource.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/datasource/datasource.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/services/settings/meter/meter.service.js',
                                                    'app/services/users/user/user.service.js',
                                                    'app/controllers/settings/photovoltaicpowerstation/photovoltaicpowerstation.master.controller.js',
                                                    'app/controllers/settings/photovoltaicpowerstation/photovoltaicpowerstation.controller.js',
                                                    'app/controllers/settings/photovoltaicpowerstation/photovoltaicpowerstationinvertor.controller.js',
                                                    'app/controllers/settings/photovoltaicpowerstation/photovoltaicpowerstationgrid.controller.js',
                                                    'app/controllers/settings/photovoltaicpowerstation/photovoltaicpowerstationload.controller.js',
                                                    'app/controllers/settings/photovoltaicpowerstation/photovoltaicpowerstationuser.controller.js',
                                                    'app/controllers/settings/photovoltaicpowerstation/photovoltaicpowerstationdatasource.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.windfarm', {
                        url: "/windfarm",
                        templateUrl: "views/settings/windfarm/windfarm.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.WIND_FARM',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker', 'toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/windfarm/windfarm.service.js',
                                                    'app/services/settings/costcenter/costcenter.service.js',
                                                    'app/services/settings/contact/contact.service.js',
                                                    'app/services/settings/datasource/point.service.js',
                                                    'app/services/settings/svg/svg.service.js',
                                                    'app/controllers/settings/windfarm/windfarm.master.controller.js',
                                                    'app/controllers/settings/windfarm/windfarm.controller.js',
                                                    'app/controllers/common/export.controller.js',
                                                    'app/controllers/common/import.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.menu', {
                        url: "/menu",
                        templateUrl: "views/settings/menu/menu.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.MENU',
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/settings/menu/menu.service.js',
                                                    'app/controllers/settings/menu/menu.controller.js',
                                                    'app/controllers/settings/menu/menu.master.controller.js'
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
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
                    .state('settings.workingcalendar', {
                        url: "/workingcalendar",
                        templateUrl: "views/settings/workingcalendar/workingcalendar.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.WORKING_CALENDAR',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster', 'daterangepicker', ]).then(
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
                                                    'app/services/settings/workingcalendar/workingcalendar.service.js',
                                                    'app/services/settings/workingcalendar/workingcalendarnonworkingday.service.js',
                                                    'app/controllers/settings/workingcalendar/workingcalendar.controller.js',
                                                    'app/controllers/settings/workingcalendar/workingcalendar.master.controller.js',
                                                    'app/controllers/settings/workingcalendar/workingcalendarnonworkingday.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.advancedreport', {
                        url: "/advancedreport",
                        templateUrl: "views/settings/advancedreport/advancedreport.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.ADVANCED_REPORT',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster', 'daterangepicker', ]).then(
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
                                                    'app/services/settings/advancedreport/advancedreport.service.js',
                                                    'app/controllers/settings/advancedreport/advancedreport.controller.js',
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }

                    })
                    .state('settings.energyplanfile', {
                        url: "/energyplanfile",
                        templateUrl: "views/settings/energyplanfile/energyplanfile.html",
                        data: {
                            pageTitle: 'MENU.SETTINGS.ENERGY_PLAN_FILE',
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'toaster', 'daterangepicker', ]).then(
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
                                                    'app/services/settings/energyplanfile/energyplanfile.service.js',
                                                    'app/controllers/settings/energyplanfile/energyplanfile.controller.js'
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
                                                    'app/services/fdd/webmessage.service.js',
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
                                    return $ocLazyLoad.load(['ui.select', 'ui.checkbox', 'daterangepicker','toaster']).then(
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/users/user/user.service.js',
                                                    'app/services/users/privilege/privilege.service.js',
                                                    'app/controllers/users/user/user.controller.js',
                                                    'app/controllers/users/user/user.master.controller.js',
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
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
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
                    .state('users.log', {
                        url: "/log",
                        templateUrl: "views/users/log/log.html",
                        data: {
                            pageTitle: 'MENU.USERSETTING.LOG'
                        },

                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['toaster']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                            }, {
                                                name: 'ui.footable',
                                                files: ['js/plugins/footable/angular-footable.js']
                                            }, {
                                                serie: true,
                                                files: [
                                                    'app/services/users/log/log.service.js',
                                                    'app/controllers/users/log/log.controller.js'
                                                ]
                                            }]);
                                        }
                                    );
                                }
                            ]
                        }
                    })
                    .state('users.apikey', {
                        url: "/apikey",
                        templateUrl: "views/users/apikey/apikey.html",
                        data: {
                            pageTitle: 'MENU.USERSETTING.API_KEY'
                        },

                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['ui.select', 'toaster', 'integralui']).then(
                                        function () {
                                            return $ocLazyLoad.load([{
                                                files: [
                                                    'js/plugins/sweetalert/sweetalert.min.js',
                                                    'css/plugins/sweetalert/sweetalert.css',
                                                    'js/daterangepicker/daterangepicker.min.js',
                                                    'js/daterangepicker/daterangepicker.min.css']
                                            }, {
                                                name: 'oitozero.ngSweetAlert',
                                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
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
                                                    'app/services/users/apikey/apikey.service.js',
                                                    'app/controllers/users/apikey/apikey.controller.js'
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
                                                    'app/services/fdd/webmessage.service.js',
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
