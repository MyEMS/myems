'use strict';

app.controller('MicrogridSensorController', function (
    $scope,
    $window,
    $translate,
    MicrogridService,
    SensorService,
    MicrogridSensorService,
    toaster,
    SweetAlert) {
    $scope.currentMicrogrid = {selected:undefined};
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

    $scope.getSensorsByMicrogridID = function (id) {
        MicrogridSensorService.getSensorsByMicrogridID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.microgridsensors = response.data;
            } else {
                $scope.microgridsensors = [];
            }
        });
    };

    $scope.changeMicrogrid=function(item,model){
        $scope.currentMicrogrid=item;
        $scope.currentMicrogrid.selected=model;
        $scope.getSensorsByMicrogridID($scope.currentMicrogrid.id);
    };

    $scope.getAllMicrogrids = function () {
        MicrogridService.getAllMicrogrids(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.microgrids = response.data;
            } else {
                $scope.microgrids = [];
            }
        });
    };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var microgridid = $scope.currentMicrogrid.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridSensorService.addPair(microgridid, sensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByMicrogridID($scope.currentMicrogrid.id);
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
        var microgridsensorid = angular.element('#' + dragEl).scope().microgridsensor.id;
        var microgridid = $scope.currentMicrogrid.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridSensorService.deletePair(microgridid, microgridsensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByMicrogridID($scope.currentMicrogrid.id);
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
    $scope.getAllMicrogrids();

  	$scope.$on('handleBroadcastMicrogridChanged', function(event) {
      $scope.getAllMicrogrids();
  	});
});
