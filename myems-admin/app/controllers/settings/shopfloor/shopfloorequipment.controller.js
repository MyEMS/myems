'use strict';

// Shop Floor Equipment controller - drag-and-drop equipment binding

app.controller('ShopfloorEquipmentController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    ShopfloorService,
    EquipmentService,
    ShopfloorEquipmentService,
    toaster,
    SweetAlert,
    DragDropWarningService) {

    $scope.currentShopfloor = {selected: undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isShopfloorSelected = false;

    // Load all equipments from API
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

    // Load equipments by shopfloor id
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

    // Handle shopfloor change
    $scope.changeShopfloor = function(item, model) {
        $scope.currentShopfloor = item;
        $scope.currentShopfloor.selected = model;
        if (item && item.id) {
            $scope.isShopfloorSelected = true;
            $scope.getEquipmentsByShopfloorID($scope.currentShopfloor.id);
        } else {
            $scope.isShopfloorSelected = false;
        }
    };

    // Load all shopfloors from API
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

    // Bind equipment via drag-and-drop
    $scope.pairEquipment = function(dragEl, dropEl) {
        if (!$scope.isShopfloorSelected || !$scope.currentShopfloor || !$scope.currentShopfloor.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_SHOPFLOOR_FIRST");
            return;
        }
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

    // Unbind equipment via drag-to-trash
    $scope.deleteEquipmentPair = function(dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) return;
        if (!$scope.isShopfloorSelected || !$scope.currentShopfloor || !$scope.currentShopfloor.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_SHOPFLOOR_FIRST");
            return;
        }
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

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'BIND_EQUIPMENT',
            'SETTING.PLEASE_SELECT_SHOPFLOOR_FIRST',
            { BIND_EQUIPMENT: 2 }
        );

});
