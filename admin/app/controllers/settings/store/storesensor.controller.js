'use strict';

app.controller('StoreSensorController', function (
    $scope,
    $window,
    $translate,
    StoreService,
    SensorService,
    StoreSensorService,
    toaster,
    SweetAlert) {
    $scope.currentStore = {selected:undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.getAllSensors = function () {
      SensorService.getAllSensors(function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
              $scope.sensors = response.data;
          } else {
              $scope.sensors = [];
          }
      });
    };

    $scope.getSensorsByStoreID = function (id) {
        StoreSensorService.getSensorsByStoreID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.storesensors = response.data;
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
        StoreService.getAllStores(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.stores = response.data;
            } else {
                $scope.stores = [];
            }
        });
    };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreSensorService.addPair(storeid, sensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByStoreID($scope.currentStore.id);
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
        var storesensorid = angular.element('#' + dragEl).scope().storesensor.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreSensorService.deletePair(storeid, storesensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByStoreID($scope.currentStore.id);
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
    $scope.getAllStores();

  	$scope.$on('handleBroadcastStoreChanged', function(event) {
      $scope.getAllStores();
  	});
});
