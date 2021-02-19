'use strict';

app.controller('MeterPointController', function ($scope, $common, $uibModal, $timeout, $translate,
                                                 MeterService,
                                                 DataSourceService,
                                                 PointService,
                                                 MeterPointService,
                                                 toaster, SweetAlert) {
    $scope.currentMeter = {selected:undefined};
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

    $scope.getPointsByMeterID = function (id) {
        MeterPointService.getPointsByMeterID(id, function (error, data) {
            if (!error) {
                $scope.meterpoints = data;
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
        MeterService.getAllMeters(function (error, data) {
            if (!error) {
                $scope.meters = data;
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
        MeterPointService.addPair(meterid, pointid, function (error, status) {
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

                $scope.getPointsByMeterID($scope.currentMeter.id);
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
        var meterpointid = angular.element('#' + dragEl).scope().meterpoint.id;
        var meterid = $scope.currentMeter.id;
        MeterPointService.deletePair(meterid, meterpointid, function (error, status) {
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

                $scope.getPointsByMeterID($scope.currentMeter.id);
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
    $scope.getAllMeters();

  	$scope.$on('handleBroadcastMeterChanged', function(event) {
      $scope.getAllMeters();
  	});
});
