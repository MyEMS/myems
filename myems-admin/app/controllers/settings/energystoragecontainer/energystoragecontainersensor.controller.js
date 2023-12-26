'use strict';

app.controller('EnergyStorageContainerSensorController', function (
    $scope,
    $window,
    $translate,
    EnergyStorageContainerService,
    SensorService,
    EnergyStorageContainerSensorService,
    toaster,
    SweetAlert) {
    $scope.currentEnergyStorageContainer = {selected:undefined};
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

    $scope.getSensorsByEnergyStorageContainerID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStorageContainerSensorService.getSensorsByEnergyStorageContainerID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.energystoragecontainersensors = response.data;
            } else {
                $scope.energystoragecontainersensors = [];
            }
        });
    };

    $scope.changeEnergyStorageContainer=function(item,model){
        $scope.currentEnergyStorageContainer=item;
        $scope.currentEnergyStorageContainer.selected=model;
        $scope.getSensorsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
    };

    $scope.getAllEnergyStorageContainers = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStorageContainerService.getAllEnergyStorageContainers(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.energystoragecontainers = response.data;
            } else {
                $scope.energystoragecontainers = [];
            }
        });
    };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var energystoragecontainerid = $scope.currentEnergyStorageContainer.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStorageContainerSensorService.addPair(energystoragecontainerid, sensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
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
        var energystoragecontainersensorid = angular.element('#' + dragEl).scope().energystoragecontainersensor.id;
        var energystoragecontainerid = $scope.currentEnergyStorageContainer.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStorageContainerSensorService.deletePair(energystoragecontainerid, energystoragecontainersensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
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
    $scope.getAllEnergyStorageContainers();

  	$scope.$on('handleBroadcastEnergyStorageContainerChanged', function(event) {
      $scope.getAllEnergyStorageContainers();
  	});
});
