'use strict';

app.controller('CombinedEquipmentEquipmentController', function ($scope, $common, $uibModal, $timeout, $translate, CombinedEquipmentService, EquipmentService, CombinedEquipmentEquipmentService,  toaster, SweetAlert) {
    $scope.currentCombinedEquipment = {selected:undefined};

    $scope.getAllEquipments = function () {
      EquipmentService.getAllEquipments(function (error, data) {
          if (!error) {
              $scope.equipments = data;
          } else {
              $scope.equipments = [];
          }
      });
    };

    $scope.getEquipmentsByCombinedEquipmentID = function (id) {
        CombinedEquipmentEquipmentService.getEquipmentsByCombinedEquipmentID(id, function (error, data) {
            if (!error) {
                $scope.combinedequipmentequipments = data;
            } else {
                $scope.combinedequipmentequipments = [];
            }
        });
    };

  $scope.changeCombinedEquipment=function(item,model){
  	$scope.currentCombinedEquipment=item;
  	$scope.currentCombinedEquipment.selected=model;
  	$scope.getEquipmentsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
  };

  $scope.getAllCombinedEquipments = function () {
    CombinedEquipmentService.getAllCombinedEquipments(function (error, data) {
        if (!error) {
            $scope.combinedequipments = data;
        } else {
            $scope.combinedequipments = [];
        }
    });
  };

    $scope.pairEquipment = function (dragEl, dropEl) {
        var equipmentid = angular.element('#' + dragEl).scope().equipment.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
        CombinedEquipmentEquipmentService.addPair(combinedequipmentid, equipmentid, function (error, status) {
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

                $scope.getEquipmentsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
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
        var combinedequipmentequipmentid = angular.element('#' + dragEl).scope().combinedequipmentequipment.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
        CombinedEquipmentEquipmentService.deletePair(combinedequipmentid, combinedequipmentequipmentid, function (error, status) {
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

                $scope.getEquipmentsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
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
    $scope.getAllCombinedEquipments();

  	$scope.$on('handleBroadcastCombinedEquipmentChanged', function(event) {
      $scope.getAllCombinedEquipments();
  	});
});
