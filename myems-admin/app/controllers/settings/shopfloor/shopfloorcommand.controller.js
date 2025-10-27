'use strict';

app.controller('ShopfloorCommandController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    ShopfloorService,
    CommandService,
    ShopfloorCommandService,
    toaster) {

    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentShopfloor = {selected: undefined};

    $scope.getAllCommands = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CommandService.getAllCommands(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allCommands = response.data;
                $scope.commands = allCommands.filter(function(command) {
                    return !$scope.shopfloorcommands || !$scope.shopfloorcommands.some(function(shopfloorcommand) {
                        return shopfloorcommand.id === command.id;
                    });
                });
            } else {
                $scope.commands = [];
            }
        });
    };

    $scope.getCommandsByShopfloorID = function(id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorCommandService.getCommandsByShopfloorID(id, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloorcommands = response.data;
            } else {
                $scope.shopfloorcommands = [];
            }
            $scope.getAllCommands();
        });
    };

    $scope.changeShopfloor = function(item, model) {
        $scope.currentShopfloor = item;
        $scope.currentShopfloor.selected = model;
        $scope.getCommandsByShopfloorID($scope.currentShopfloor.id);
    };

    $scope.getAllShopfloors = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorService.getAllShopfloors(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloors = response.data;
            } else {
                $scope.shopfloors = [];
            }
        });
    };

    $scope.pairCommand = function(dragEl, dropEl) {
        var commandid = angular.element('#' + dragEl).scope().command.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorCommandService.addPair(shopfloorid, commandid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByShopfloorID(shopfloorid);
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
        var shopfloorcommandid = angular.element('#' + dragEl).scope().shopfloorcommand.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorCommandService.deletePair(shopfloorid, shopfloorcommandid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByShopfloorID(shopfloorid);
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

    $scope.getAllShopfloors();
    $scope.getAllCommands();

    $scope.$on('handleBroadcastShopfloorChanged', function(event) {
        $scope.getAllShopfloors();
    });

});
