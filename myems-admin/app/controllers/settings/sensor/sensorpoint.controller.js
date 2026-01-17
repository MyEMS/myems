'use strict';

app.controller('SensorPointController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    SensorService,
    DataSourceService,
    PointService,
    SensorPointService,
    toaster,
    SweetAlert,
    DragDropWarningService) {

    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentSensor = { selected: undefined };
    $scope.isSensorSelected = false;

    $scope.getAllDataSources = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DataSourceService.getAllDataSources(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.datasources = response.data;
                if ($scope.datasources.length > 0) {
                    $scope.currentDataSource = $scope.datasources[0].id;
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.datasources = [];
            }
        });
    };

    $scope.getPointsByDataSourceID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        PointService.getPointsByDataSourceID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allPoints = response.data;
                if ($scope.sensorpoints && $scope.sensorpoints.length > 0) {
                    const boundIds = $scope.sensorpoints.map(p => p.id);
                    $scope.points = allPoints.filter(p => !boundIds.includes(p.id));
                } else {
                    $scope.points = allPoints;
                }
            } else {
                $scope.points = [];
            }
        });
    };

    $scope.getPointsBySensorID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorPointService.getPointsBySensorID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensorpoints = response.data;

                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.sensorpoints = [];
            }
        });
    };

    $scope.changeSensor = function (item, model) {
        $scope.currentSensor = item;
        $scope.currentSensor.selected = model;
        if (item && item.id) {
            $scope.isSensorSelected = true;
            $scope.getPointsBySensorID($scope.currentSensor.id);
        } else {
            $scope.isSensorSelected = false;
        }
    };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllSensors = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorService.getAllSensors(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensors = response.data;
                $timeout(function () {
                    if ($scope.currentSensor && $scope.currentSensor.id) {
                        $scope.isSensorSelected = true;
                        $scope.getPointsBySensorID($scope.currentSensor.id);
                    }
                }, 1000);
            } else {
                $scope.sensors = [];
            }
        });
    };

    $scope.pairPoint = function (dragEl, dropEl) {
        if (!$scope.isSensorSelected || !$scope.currentSensor || !$scope.currentSensor.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_SENSOR_FIRST");
            return;
        }
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var sensorid = $scope.currentSensor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorPointService.addPair(sensorid, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant('TOASTER.BIND_POINT_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getPointsBySensorID($scope.currentSensor.id);
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

    $scope.deletePointPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        if (!$scope.isSensorSelected || !$scope.currentSensor || !$scope.currentSensor.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_SENSOR_FIRST");
            return;
        }
        var sensorpointid = angular.element('#' + dragEl).scope().sensorpoint.id;
        var sensorid = $scope.currentSensor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorPointService.deletePair(sensorid, sensorpointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsBySensorID($scope.currentSensor.id);
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

    $scope.getAllDataSources();
    $scope.getAllSensors();

    $scope.$on('handleBroadcastSensorChanged', function (event) {
        $scope.getAllSensors();
    });

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
        $scope,
        'BIND_POINT',
        'SETTING.PLEASE_SELECT_SENSOR_FIRST',
        { BIND_POINT: 1 }
    );
});
