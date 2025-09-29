'use strict';

app.controller('MenuController', function (
    $scope,
    $rootScope,
    $window,
    $uibModal,
    MenuService,
    toaster,
    $translate) {
    $scope.menus = [];
    $scope.rawMenus = [];
    $scope.currentMenu = {};
    $scope.currentMenuChildren = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

    $scope.getAllMenus = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MenuService.getAllMenus(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.rawMenus = response.data;
                $scope.menus = $scope.rawMenus.map(menu => {
                    let t = angular.copy(menu);
                    t.name = $translate.instant(menu.name) || menu.name;
                    return t;
                });
            } else {
                $scope.menus = [];
                $scope.rawMenus = [];
            }
            var treedata = { 'core': { 'data': [], "multiple": false }, "plugins": ["wholerow"] };
            for (var i = 0; i < $scope.menus.length; i++) {
                var node = {
                    "id": $scope.menus[i].id.toString(),
                    "parent": $scope.menus[i].parent_menu_id ? $scope.menus[i].parent_menu_id.toString() : '#',
                    "text": $scope.menus[i].name,
                    "state": { 'opened': true }
                };
                treedata['core']['data'].push(node);
            }
            var menutree = document.getElementById("menutree");
            angular.element(menutree).jstree(treedata);
            angular.element(menutree).on("changed.jstree", function (e, data) {
                if (data.action === 'ready' || data.action === 'select_node') {
                    $scope.getMenuChildren(parseInt(data.selected[0]));
                }
            });
        });
    };

    $scope.refreshMenuTree = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MenuService.getAllMenus(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.rawMenus = response.data;
                $scope.menus = $scope.rawMenus.map(menu => {
                    let t = angular.copy(menu);
                    t.name = $translate.instant(menu.name) || menu.name;
                    return t;
                });
            } else {
                $scope.menus = [];
                $scope.rawMenus = [];
            }
            var treedata = { 'core': { 'data': [], "multiple": false }, "plugins": ["wholerow"] };
            for (var i = 0; i < $scope.menus.length; i++) {
                var node = {
                    "id": $scope.menus[i].id.toString(),
                    "parent": $scope.menus[i].parent_menu_id ? $scope.menus[i].parent_menu_id.toString() : '#',
                    "text": $scope.menus[i].name,
                    "state": { 'opened': true }
                };
                treedata['core']['data'].push(node);
            }
            var menutree = document.getElementById("menutree");
            angular.element(menutree).jstree(true).settings.core.data = treedata['core']['data'];
            angular.element(menutree).jstree(true).refresh();
        });
    };

    $scope.getMenuChildren = function (menuid) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MenuService.getMenuChildren(menuid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.currentMenu = angular.copy(response.data["current"]);

                $scope.currentMenu.name = $translate.instant($scope.currentMenu.name) || $scope.currentMenu.name;

                if ($scope.currentMenu.parent_menu) {
                    const translatedParentName = $translate.instant($scope.currentMenu.parent_menu.name) || $scope.currentMenu.parent_menu.name;
                    $scope.currentMenu.parent_menu.name = translatedParentName;
                } else {
                    $scope.currentMenu.parent_menu = null;
                }

                $scope.currentMenuChildren = response.data["children"].map(child => {
                    let t = angular.copy(child);
                    t.name = $translate.instant(child.name) || child.name;
                    if (t.parent_menu) {
                        t.parent_menu.name = $translate.instant(t.parent_menu.name) || t.parent_menu.name;
                    }
                    return t;
                });
            } else {
                $scope.currentMenu = {};
                $scope.currentMenu.parent_menu = null;
                $scope.currentMenuChildren = [];
            }
        });
    };

    $scope.editMenu = function (menu) {
        var modalInstance = $uibModal.open({
            windowClass: "animated fadeIn",
            templateUrl: 'views/settings/menu/menu.model.html',
            controller: 'ModalEditMenuCtrl',
            resolve: {
                params: function () {
                    return {
                        menu: angular.copy(menu),
                        menus: angular.copy($scope.menus),
                    };
                }
            }
        });

        modalInstance.result.then(function (modifiedMenu) {
            let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
            MenuService.editMenu(modifiedMenu, headers, function (response) {
                if (angular.isDefined(response.status) && response.status === 200) {
                    toaster.pop({
                        type: "success",
                        title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                        body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("COMMON.MENU") }),
                        showCloseButton: true,
                    });
                    $scope.$emit('handleEmitMenuChanged');
                } else {
                    toaster.pop({
                        type: "error",
                        title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("COMMON.MENU") }),
                        body: $translate.instant(response.data.description),
                        showCloseButton: true,
                    });
                }
            });
        });
        $rootScope.modalInstance = modalInstance;
    };

    $scope.getAllMenus();
    $scope.$on('handleBroadcastMenuChanged', function (event) {
        $scope.refreshMenuTree();
    });

});


app.controller('ModalEditMenuCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation = "SETTING.EDIT_MENU";
    $scope.menu = params.menu;

    $scope.ok = function () {
        $uibModalInstance.close($scope.menu);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});