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

    $scope.currentStore = {selected: undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.getAllSensors = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorService.getAllSensors(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allSensors = response.data;
                $scope.sensors = allSensors.filter(function(sensor) {
                    return !$scope.storesensors.some(function(storesensor) {
                        return storesensor.id === sensor.id;
                    });
                });
            } else {
                $scope.sensors = [];
            }
        });
    };

    $scope.getSensorsByStoreID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreSensorService.getSensorsByStoreID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.storesensors = response.data;
                $scope.getAllSensors();
            } else {
                $scope.storesensors = [];
                $scope.getAllSensors();
            }
        });
    };

    $scope.changeStore = function(item, model) {
        $scope.currentStore = item;
        $scope.currentStore.selected = model;
        $scope.getSensorsByStoreID($scope.currentStore.id);
    };
    $scope.getAllStores = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreService.getAllStores(headers, function (response) {
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
                $scope.getAllSensors();
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

    $scope.getAllStores();
    $scope.getAllSensors();
    $scope.$on('handleBroadcastStoreChanged', function(event) {
        $scope.getAllStores();
    });

});
