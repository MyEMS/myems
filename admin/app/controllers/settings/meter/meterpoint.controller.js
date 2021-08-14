'use strict';

app.controller('MeterPointController', function ($scope, $timeout, $translate,
                                                 MeterService,
                                                 DataSourceService,
                                                 PointService,
                                                 MeterPointService,
                                                 toaster) {
    $scope.currentMeter = {selected:undefined};
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

    $scope.getPointsByMeterID = function (id) {
        MeterPointService.getPointsByMeterID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.meterpoints = response.data;
            } else {
                $scope.meterpoints = [];
            }
        });
    };

  $scope.changeMeter=function(item,model){
  	$scope.currentMeter=item;
  	$scope.currentMeter.selected=model;
  	$scope.getPointsByMeterID($scope.currentMeter.id);
  };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllMeters = function () {
        MeterService.getAllMeters(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.meters = response.data;
                $timeout(function () {
                    $scope.getPointsByMeterID($scope.currentMeter.id);
                }, 1000);
            } else {
                $scope.meters = [];
            }
        });

    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var meterid = $scope.currentMeter.id;
        MeterPointService.addPair(meterid, pointid, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByMeterID($scope.currentMeter.id);
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
        var meterpointid = angular.element('#' + dragEl).scope().meterpoint.id;
        var meterid = $scope.currentMeter.id;
        MeterPointService.deletePair(meterid, meterpointid, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByMeterID($scope.currentMeter.id);
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
    $scope.getAllMeters();

  	$scope.$on('handleBroadcastMeterChanged', function(event) {
      $scope.getAllMeters();
  	});
});
