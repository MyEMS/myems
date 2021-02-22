'use strict';

app.controller('ShopfloorEquipmentController', function ($scope, $common, $uibModal, $timeout, $translate, ShopfloorService, EquipmentService, ShopfloorEquipmentService,  toaster, SweetAlert) {
    $scope.currentShopfloor = {selected:undefined};

    $scope.getAllEquipments = function () {
        EquipmentService.getAllEquipments(function (error, data) {
          if (!error) {
              $scope.equipments = data;
          } else {
              $scope.equipments = [];
          }
      });
    };

    $scope.getEquipmentsByShopfloorID = function (id) {
        ShopfloorEquipmentService.getEquipmentsByShopfloorID(id, function (error, data) {
            if (!error) {
                $scope.shopfloorequipments = data;
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
    ShopfloorService.getAllShopfloors(function (error, data) {
        if (!error) {
            $scope.shopfloors = data;
        } else {
            $scope.shopfloors = [];
        }
    });
  };

    $scope.pairEquipment = function (dragEl, dropEl) {
        var equipmentid = angular.element('#' + dragEl).scope().equipment.id;
        var shopfloorid = $scope.currentShopfloor.id;
        ShopfloorEquipmentService.addPair(shopfloorid, equipmentid, function (error, status) {
            if (angular.isDefined(status) && status == 201) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.BIND_EQUIPMENT_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getEquipmentsByShopfloorID($scope.currentShopfloor.id);
            } else {
                var popType = 'TOASTER.ERROR';
                var popTitle = error.title;
                var popBody = error.description;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
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
        ShopfloorEquipmentService.deletePair(shopfloorid, shopfloorequipmentid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.UNBIND_EQUIPMENT_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getEquipmentsByShopfloorID($scope.currentShopfloor.id);
            } else {
                var popType = 'TOASTER.ERROR';
                var popTitle = error.title;
                var popBody = error.description;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
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
