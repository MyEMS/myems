'use strict';

app.controller('SensorPointController', function ($scope, $timeout, $translate, SensorService, DataSourceService, PointService, SensorPointService, toaster, SweetAlert) {
    $scope.currentSensor = {selected:undefined};
    $scope.getAllDataSources = function () {
        DataSourceService.getAllDataSources(function (response) {
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
        PointService.getPointsByDataSourceID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.points = response.data;
            } else {
                $scope.points = [];
            }
        });

    };

    $scope.getPointsBySensorID = function (id) {
        SensorPointService.getPointsBySensorID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensorpoints = response.data;
            } else {
                $scope.sensorpoints = [];
            }
        });

    };

  $scope.changeSensor=function(item,model){
  	$scope.currentSensor=item;
  	$scope.currentSensor.selected=model;
  	$scope.getPointsBySensorID($scope.currentSensor.id);
  };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllSensors = function () {
        SensorService.getAllSensors(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensors = response.data;
                $timeout(function () {
                    $scope.getPointsBySensorID($scope.currentSensor.id);
                }, 1000);
            } else {
                $scope.sensors = [];
            }
        });

    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var sensorid = $scope.currentSensor.id;
        SensorPointService.addPair(sensorid, pointid, function (response) {
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
        var sensorpointid = angular.element('#' + dragEl).scope().sensorpoint.id;
        var sensorid = $scope.currentSensor.id;
        SensorPointService.deletePair(sensorid, sensorpointid, function (response) {
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

  	$scope.$on('handleBroadcastSensorChanged', function(event) {
      $scope.getAllSensors();
  	});
});
