'use strict';

app.controller('EnergyStoragePowerStationSensorController', function (
    $scope,
    $window,
    $translate,
    EnergyStoragePowerStationService,
    SensorService,
    EnergyStoragePowerStationSensorService,
    toaster,
    SweetAlert) {
    $scope.currentEnergyStoragePowerStation = {selected:undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.getAllSensors = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorService.getAllSensors(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensors = response.data;
            } else {
                $scope.sensors = [];
            }
        });
    };

    $scope.getSensorsByEnergyStoragePowerStationID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStoragePowerStationSensorService.getSensorsByEnergyStoragePowerStationID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.energystoragepowerstationsensors = response.data;
            } else {
                $scope.energystoragepowerstationsensors = [];
            }
        });
    };

    $scope.changeEnergyStoragePowerStation=function(item,model){
        $scope.currentEnergyStoragePowerStation=item;
        $scope.currentEnergyStoragePowerStation.selected=model;
        $scope.getSensorsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
    };

    $scope.getAllEnergyStoragePowerStations = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStoragePowerStationService.getAllEnergyStoragePowerStations(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.energystoragepowerstations = response.data;
            } else {
                $scope.energystoragepowerstations = [];
            }
        });
    };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var energystoragepowerstationid = $scope.currentEnergyStoragePowerStation.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStoragePowerStationSensorService.addPair(energystoragepowerstationid, sensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
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
        var energystoragepowerstationsensorid = angular.element('#' + dragEl).scope().energystoragepowerstationsensor.id;
        var energystoragepowerstationid = $scope.currentEnergyStoragePowerStation.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStoragePowerStationSensorService.deletePair(energystoragepowerstationid, energystoragepowerstationsensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
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
    $scope.getAllEnergyStoragePowerStations();

  	$scope.$on('handleBroadcastEnergyStoragePowerStationChanged', function(event) {
      $scope.getAllEnergyStoragePowerStations();
  	});
});
