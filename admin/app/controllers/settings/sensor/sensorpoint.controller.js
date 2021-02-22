'use strict';

app.controller('SensorPointController', function ($scope, $common, $uibModal, $timeout, $translate, SensorService, DataSourceService, PointService, SensorPointService, toaster, SweetAlert) {
    $scope.currentSensor = {selected:undefined};
    $scope.getAllDataSources = function () {
        DataSourceService.getAllDataSources(function (error, data) {
            if (!error) {
                $scope.datasources = data;
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
        PointService.getPointsByDataSourceID(id, function (error, data) {
            if (!error) {
                $scope.points = data;
            } else {
                $scope.points = [];
            }
        });

    };

    $scope.getPointsBySensorID = function (id) {
        SensorPointService.getPointsBySensorID(id, function (error, data) {
            if (!error) {
                $scope.sensorpoints = data;
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
        SensorService.getAllSensors(function (error, data) {
            if (!error) {
                $scope.sensors = data;
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
        SensorPointService.addPair(sensorid, pointid, function (error, status) {
            if (angular.isDefined(status) && status == 201) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.BIND_POINT_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getPointsBySensorID($scope.currentSensor.id);
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

    $scope.deletePointPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var sensorpointid = angular.element('#' + dragEl).scope().sensorpoint.id;
        var sensorid = $scope.currentSensor.id;
        SensorPointService.deletePair(sensorid, sensorpointid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.UNBIND_POINT_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
                $scope.getPointsBySensorID($scope.currentSensor.id);
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

    $scope.getAllDataSources();
    $scope.getAllSensors();

  	$scope.$on('handleBroadcastSensorChanged', function(event) {
      $scope.getAllSensors();
  	});
});
