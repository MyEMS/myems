'use strict';

app.controller('ShopfloorSensorController', function ($scope, $translate, ShopfloorService, SensorService, ShopfloorSensorService,  toaster, SweetAlert) {
    $scope.currentShopfloor = {selected:undefined};

    $scope.getAllSensors = function () {
      SensorService.getAllSensors(function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
              $scope.sensors = response.data;
          } else {
              $scope.sensors = [];
          }
      });
    };

    $scope.getSensorsByShopfloorID = function (id) {
        ShopfloorSensorService.getSensorsByShopfloorID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloorsensors = response.data;
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
        ShopfloorService.getAllShopfloors(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloors = response.data;
            } else {
                $scope.shopfloors = [];
            }
        });
    };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var shopfloorid = $scope.currentShopfloor.id;
        ShopfloorSensorService.addPair(shopfloorid, sensorid, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByShopfloorID($scope.currentShopfloor.id);
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

    $scope.deleteSensorPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var shopfloorsensorid = angular.element('#' + dragEl).scope().shopfloorsensor.id;
        var shopfloorid = $scope.currentShopfloor.id;
        ShopfloorSensorService.deletePair(shopfloorid, shopfloorsensorid, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByShopfloorID($scope.currentShopfloor.id);
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

    $scope.getAllSensors();
    $scope.getAllShopfloors();

  	$scope.$on('handleBroadcastShopfloorChanged', function(event) {
      $scope.getAllShopfloors();
  	});
});
