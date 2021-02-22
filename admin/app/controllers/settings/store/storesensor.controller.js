'use strict';

app.controller('StoreSensorController', function ($scope, $common, $uibModal, $timeout, $translate, StoreService, SensorService, StoreSensorService,  toaster, SweetAlert) {
    $scope.currentStore = {selected:undefined};

    $scope.getAllSensors = function () {
      SensorService.getAllSensors(function (error, data) {
          if (!error) {
              $scope.sensors = data;
          } else {
              $scope.sensors = [];
          }
      });
    };

    $scope.getSensorsByStoreID = function (id) {
        StoreSensorService.getSensorsByStoreID(id, function (error, data) {
            if (!error) {
                $scope.storesensors = data;
            } else {
                $scope.storesensors = [];
            }
        });
    };

  $scope.changeStore=function(item,model){
  	$scope.currentStore=item;
  	$scope.currentStore.selected=model;
  	$scope.getSensorsByStoreID($scope.currentStore.id);
  };

  $scope.getAllStores = function () {
    StoreService.getAllStores(function (error, data) {
        if (!error) {
            $scope.stores = data;
        } else {
            $scope.stores = [];
        }
    });
  };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var storeid = $scope.currentStore.id;
        StoreSensorService.addPair(storeid, sensorid, function (error, status) {
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

                $scope.getSensorsByStoreID($scope.currentStore.id);
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
        var storesensorid = angular.element('#' + dragEl).scope().storesensor.id;
        var storeid = $scope.currentStore.id;
        StoreSensorService.deletePair(storeid, storesensorid, function (error, status) {
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

                $scope.getSensorsByStoreID($scope.currentStore.id);
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
    $scope.getAllStores();

  	$scope.$on('handleBroadcastStoreChanged', function(event) {
      $scope.getAllStores();
  	});
});
