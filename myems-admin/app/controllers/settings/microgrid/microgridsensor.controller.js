'use strict';

app.controller('MicrogridSensorController', function (
    $scope,
    $rootScope,
    $window,
    $timeout,
    $translate,
    MicrogridService,
    SensorService,
    MicrogridSensorService,
    toaster,
    SweetAlert,
    DragDropWarningService) {
    $scope.currentMicrogrid = {selected:undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isMicrogridSelected = false;
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

    $scope.getSensorsByMicrogridID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridSensorService.getSensorsByMicrogridID(id, headers, function (response) {
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
        if ($scope.currentMicrogrid && $scope.currentMicrogrid.id) {
            $scope.isMicrogridSelected = true;
            $scope.getSensorsByMicrogridID($scope.currentMicrogrid.id);
        } else {
            $scope.isMicrogridSelected = false;
        }
    };

    $scope.getAllMicrogrids = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridService.getAllMicrogrids(headers, function (response) {
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

    // Listen directly to HJC-DRAG-DISABLED event and show warning
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        if (!$scope.isMicrogridSelected) {
            // Use rootScope flag to prevent multiple warnings from different controllers
            if (!$rootScope._microgridDragWarningShown) {
                $rootScope._microgridDragWarningShown = true;
                DragDropWarningService.showWarning('SETTING.PLEASE_SELECT_MICROGRID_FIRST');
                $timeout(function() {
                    $rootScope._microgridDragWarningShown = false;
                }, 500); // Reset flag after 500ms
            }
        }
    });
});
