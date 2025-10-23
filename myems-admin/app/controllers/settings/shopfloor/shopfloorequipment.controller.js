'use strict';

app.controller('ShopfloorEquipmentController', function (
    $scope,
    $window,
    $translate,
    ShopfloorService,
    EquipmentService,
    ShopfloorEquipmentService,
    toaster,
    SweetAlert) {

    $scope.currentShopfloor = {selected: undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

    $scope.getAllEquipments = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EquipmentService.getAllEquipments(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allEquipments = response.data;
                $scope.equipments = allEquipments.filter(function(equipment) {
                    return !$scope.shopfloorequipments || !$scope.shopfloorequipments.some(function(se) {
                        return se.id === equipment.id;
                    });
                });
            } else {
                $scope.equipments = [];
            }
        });
    };

    $scope.getEquipmentsByShopfloorID = function(id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorEquipmentService.getEquipmentsByShopfloorID(id, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloorequipments = response.data;
            } else {
                $scope.shopfloorequipments = [];
            }
            $scope.getAllEquipments();
        });
    };

    $scope.changeShopfloor = function(item, model) {
        $scope.currentShopfloor = item;
        $scope.currentShopfloor.selected = model;
        $scope.getEquipmentsByShopfloorID($scope.currentShopfloor.id);
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

    $scope.pairEquipment = function(dragEl, dropEl) {
        var equipmentid = angular.element('#' + dragEl).scope().equipment.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorEquipmentService.addPair(shopfloorid, equipmentid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_EQUIPMENT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getEquipmentsByShopfloorID(shopfloorid);
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

    $scope.deleteEquipmentPair = function(dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) return;
        var shopfloorequipmentid = angular.element('#' + dragEl).scope().shopfloorequipment.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorEquipmentService.deletePair(shopfloorid, shopfloorequipmentid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_EQUIPMENT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getEquipmentsByShopfloorID(shopfloorid);
                $scope.getAllEquipments();
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
    $scope.getAllEquipments();

    $scope.$on('handleBroadcastShopfloorChanged', function(event) {
        $scope.getAllShopfloors();
    });

});
