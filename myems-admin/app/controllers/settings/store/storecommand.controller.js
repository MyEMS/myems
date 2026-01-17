'use strict';

app.controller('StoreCommandController', function (
    $scope,
    $rootScope,
    $window,
    $timeout,
    $translate,
    StoreService,
    CommandService,
    StoreCommandService,
    toaster,
    DragDropWarningService) {

    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentStore = {selected: undefined};
    $scope.storecommands = [];
    $scope.isStoreSelected = false;

    $scope.getAllCommands = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CommandService.getAllCommands(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allCommands = response.data;
                $scope.commands = allCommands.filter(function(command) {
                    return !$scope.storecommands.some(function(storecommand) {
                        return storecommand.id === command.id;
                    });
                });
            } else {
                $scope.commands = [];
            }
        });
    };

    $scope.getCommandsByStoreID = function(id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreCommandService.getCommandsByStoreID(id, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.storecommands = response.data;
                $scope.getAllCommands();
            } else {
                $scope.storecommands = [];
                $scope.getAllCommands();
            }
        });
    };

    $scope.changeStore = function(item, model) {
        $scope.currentStore = item;
        $scope.currentStore.selected = model;
        if (item && item.id) {
            $scope.isStoreSelected = true;
            $scope.getCommandsByStoreID($scope.currentStore.id);
        } else {
            $scope.isStoreSelected = false;
        }
    };

    $scope.getAllStores = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreService.getAllStores(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.stores = response.data;
            } else {
                $scope.stores = [];
            }
        });
    };

    $scope.pairCommand = function(dragEl, dropEl) {
        if (!$scope.isStoreSelected || !$scope.currentStore || !$scope.currentStore.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_STORE_FIRST");
            return;
        }
        var commandid = angular.element('#' + dragEl).scope().command.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreCommandService.addPair(storeid, commandid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByStoreID(storeid);
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.deleteCommandPair = function(dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) return;
        if (!$scope.isStoreSelected || !$scope.currentStore || !$scope.currentStore.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_STORE_FIRST");
            return;
        }
        var storecommandid = angular.element('#' + dragEl).scope().storecommand.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreCommandService.deletePair(storeid, storecommandid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByStoreID(storeid);
                $scope.getAllCommands();
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.getAllStores();
    $scope.getAllCommands();

    $scope.$on('handleBroadcastStoreChanged', function(event) {
        $scope.getAllStores();
    });

    // Register drag and drop warning event listeners
    // Listen directly to HJC-DRAG-DISABLED event and show warning
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        if (!$scope.isStoreSelected) {
            // Use rootScope flag to prevent multiple warnings from different controllers
            if (!$rootScope._storeDragWarningShown) {
                $rootScope._storeDragWarningShown = true;
                DragDropWarningService.showWarning('SETTING.PLEASE_SELECT_STORE_FIRST');
                $timeout(function() {
                    $rootScope._storeDragWarningShown = false;
                }, 500);
            }
        }
    });

});
