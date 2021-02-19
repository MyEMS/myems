'use strict';

app.controller('ShopfloorSensorController', function ($scope, $common, $uibModal, $timeout, $translate, ShopfloorService, SensorService, ShopfloorSensorService,  toaster, SweetAlert) {
    $scope.currentShopfloor = {selected:undefined};

    $scope.getAllSensors = function () {
      SensorService.getAllSensors(function (error, data) {
          if (!error) {
              $scope.sensors = data;
          } else {
              $scope.sensors = [];
          }
      });
    };

    $scope.getSensorsByShopfloorID = function (id) {
        ShopfloorSensorService.getSensorsByShopfloorID(id, function (error, data) {
            if (!error) {
                $scope.shopfloorsensors = data;
            } else {
                $scope.shopfloorsensors = [];
            }
        });
    };

  $scope.changeShopfloor=function(item,model){
  	$scope.currentShopfloor=item;
  	$scope.currentShopfloor.selected=model;
  	$scope.getSensorsByShopfloorID($scope.currentShopfloor.id);
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

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var shopfloorid = $scope.currentShopfloor.id;
        ShopfloorSensorService.addPair(shopfloorid, sensorid, function (error, status) {
            if (angular.isDefined(status) && status == 201) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.BIND_SENSOR_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getSensorsByShopfloorID($scope.currentShopfloor.id);
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

    $scope.deleteSensorPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var shopfloorsensorid = angular.element('#' + dragEl).scope().shopfloorsensor.id;
        var shopfloorid = $scope.currentShopfloor.id;
        ShopfloorSensorService.deletePair(shopfloorid, shopfloorsensorid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.UNBIND_SENSOR_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getSensorsByShopfloorID($scope.currentShopfloor.id);
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

    $scope.getAllSensors();
    $scope.getAllShopfloors();

  	$scope.$on('handleBroadcastShopfloorChanged', function(event) {
      $scope.getAllShopfloors();
  	});
});
