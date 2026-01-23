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
                $scope.allPoints = response.data;
                $scope.filterAvailablePoints();
            } else {
                $scope.allPoints = [];
                $scope.filteredPoints = [];
            }
        });
    };

    // Filter out points that are already bound to the current sensor,
    // keeping only available points for selection
    $scope.filterAvailablePoints = function() {
        var boundSet = {};
        ($scope.sensorpoints || []).forEach(function(sp) {
            if (angular.isDefined(sp.id)) {
                boundSet[String(sp.id)] = true;
            }
        });

        $scope.filteredPoints = ($scope.allPoints || []).filter(function(p){
            return !boundSet[String(p.id)];
        });
    };

    $scope.getPointsBySensorID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorPointService.getPointsBySensorID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensorpoints = response.data;
                $scope.filterAvailablePoints();
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.sensorpoints = [];
                $scope.filterAvailablePoints();
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
            $scope.sensorpoints = [];
            $scope.filterAvailablePoints();
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

    $scope.tabInitialized = false;

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllDataSources();
            $scope.getAllSensors();
        }
    };

    $scope.$on('sensor.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_POINT) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentSensor && $scope.currentSensor.id) {
                $scope.getPointsBySensorID($scope.currentSensor.id);
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_POINT) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentSensor && $scope.currentSensor.id) {
                $scope.getPointsBySensorID($scope.currentSensor.id);
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            }
        }
    }, 0);

    $scope.$on('handleBroadcastSensorChanged', function (event) {
        if ($scope.tabInitialized) {
            $scope.getAllSensors();
            if ($scope.currentSensor && $scope.currentSensor.id) {
                $scope.getPointsBySensorID($scope.currentSensor.id);
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            }
        }
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
