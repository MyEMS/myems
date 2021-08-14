'use strict';

app.controller('ShopfloorEquipmentController', function ($scope, $translate, ShopfloorService, EquipmentService, ShopfloorEquipmentService,  toaster, SweetAlert) {
    $scope.currentShopfloor = {selected:undefined};

    $scope.getAllEquipments = function () {
        EquipmentService.getAllEquipments(function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
              $scope.equipments = response.data;
          } else {
              $scope.equipments = [];
          }
      });
    };

    $scope.getEquipmentsByShopfloorID = function (id) {
        ShopfloorEquipmentService.getEquipmentsByShopfloorID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloorequipments = response.data;
            } else {
                $scope.shopfloorequipments = [];
            }
        });
    };

  $scope.changeShopfloor=function(item,model){
  	$scope.currentShopfloor=item;
  	$scope.currentShopfloor.selected=model;
  	$scope.getEquipmentsByShopfloorID($scope.currentShopfloor.id);
  };

  $scope.getAllShopfloors = function () {
    ShopfloorService.getAllShopfloors(function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
            $scope.shopfloors = response.data;
        } else {
            $scope.shopfloors = [];
        }
    });
  };

    $scope.pairEquipment = function (dragEl, dropEl) {
        var equipmentid = angular.element('#' + dragEl).scope().equipment.id;
        var shopfloorid = $scope.currentShopfloor.id;
        ShopfloorEquipmentService.addPair(shopfloorid, equipmentid, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_EQUIPMENT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getEquipmentsByShopfloorID($scope.currentShopfloor.id);
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

    $scope.deleteEquipmentPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var shopfloorequipmentid = angular.element('#' + dragEl).scope().shopfloorequipment.id;
        var shopfloorid = $scope.currentShopfloor.id;
        ShopfloorEquipmentService.deletePair(shopfloorid, shopfloorequipmentid, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_EQUIPMENT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getEquipmentsByShopfloorID($scope.currentShopfloor.id);
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

    $scope.getAllEquipments();
    $scope.getAllShopfloors();

  	$scope.$on('handleBroadcastShopfloorChanged', function(event) {
      $scope.getAllShopfloors();
  	});
});
