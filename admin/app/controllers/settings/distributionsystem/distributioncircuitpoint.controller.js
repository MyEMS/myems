'use strict';

app.controller('DistributionCircuitPointController', function ($scope, $common, $uibModal, $timeout, $translate, DistributionCircuitService, DataSourceService, PointService, DistributionCircuitPointService, toaster, SweetAlert) {
    $scope.currentDistributionCircuit = {selected:undefined};
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

    $scope.getPointsByDistributionCircuitID = function (id) {
        DistributionCircuitPointService.getPointsByDistributionCircuitID(id, function (error, data) {
            if (!error) {
                $scope.distributioncircuitpoints = data;
            } else {
                $scope.distributioncircuitpoints = [];
            }
        });
    };

  $scope.changeDistributionCircuit=function(item,model){
  	$scope.currentDistributionCircuit=item;
  	$scope.currentDistributionCircuit.selected=model;
  	$scope.getPointsByDistributionCircuitID($scope.currentDistributionCircuit.id);
  };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllDistributionCircuits = function () {
        DistributionCircuitService.getAllDistributionCircuits(function (error, data) {
            if (!error) {
                $scope.distributioncircuits = data;
                for(var i = 0; i < $scope.distributioncircuits.length; i++) {
                  $scope.distributioncircuits[i].name = $scope.distributioncircuits[i].distribution_system.name + '/' + $scope.distributioncircuits[i].name;
               }
                $timeout(function () {
                    $scope.getPointsByDistributionCircuitID($scope.currentDistributionCircuit.id);
                }, 1000);
            } else {
                $scope.distributioncircuits = [];
            }
        });

    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var distributioncircuitid = $scope.currentDistributionCircuit.id;
        DistributionCircuitPointService.addPair(distributioncircuitid, pointid, function (error, status) {
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

                $scope.getPointsByDistributionCircuitID($scope.currentDistributionCircuit.id);
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
        var distributioncircuitpointid = angular.element('#' + dragEl).scope().distributioncircuitpoint.id;
        var distributioncircuitid = $scope.currentDistributionCircuit.id;
        DistributionCircuitPointService.deletePair(distributioncircuitid, distributioncircuitpointid, function (error, status) {
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

                $scope.getPointsByDistributionCircuitID($scope.currentDistributionCircuit.id);
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
    $scope.getAllDistributionCircuits();

    $scope.$on('handleBroadcastDistributionCircuitChanged', function(event) {
      $scope.getAllDistributionCircuits();
  	});
});
