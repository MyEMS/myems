'use strict';
app.controller('DistributionCircuitPointController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    DistributionCircuitService,
    DataSourceService,
    PointService,
    DistributionCircuitPointService,
    toaster,
    SweetAlert
) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentDistributionCircuit = { selected: undefined };

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
                if ($scope.distributioncircuitpoints && $scope.distributioncircuitpoints.length > 0) {
                    const boundIds = $scope.distributioncircuitpoints.map(p => p.id);
                    $scope.points = allPoints.filter(p => !boundIds.includes(p.id));
                } else {
                    $scope.points = allPoints;
                }
            } else {
                $scope.points = [];
            }
        });
    };

    $scope.getPointsByDistributionCircuitID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DistributionCircuitPointService.getPointsByDistributionCircuitID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.distributioncircuitpoints = response.data;
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.distributioncircuitpoints = [];
            }
        });
    };

    $scope.changeDistributionCircuit = function (item, model) {
        $scope.currentDistributionCircuit = item;
        $scope.currentDistributionCircuit.selected = model;
        $scope.getPointsByDistributionCircuitID($scope.currentDistributionCircuit.id);
    };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllDistributionCircuits = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DistributionCircuitService.getAllDistributionCircuits(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.distributioncircuits = response.data;
                for (var i = 0; i < $scope.distributioncircuits.length; i++) {
                    $scope.distributioncircuits[i].name = $scope.distributioncircuits[i].distribution_system.name + '/' + $scope.distributioncircuits[i].name;
                }
                $timeout(function () {
                    if ($scope.currentDistributionCircuit.id) {
                        $scope.getPointsByDistributionCircuitID($scope.currentDistributionCircuit.id);
                    }
                }, 1000);
            } else {
                $scope.distributioncircuits = [];
            }
        });
    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var distributioncircuitid = $scope.currentDistributionCircuit.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DistributionCircuitPointService.addPair(distributioncircuitid, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant('TOASTER.BIND_POINT_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getPointsByDistributionCircuitID($scope.currentDistributionCircuit.id);
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
        var distributioncircuitpointid = angular.element('#' + dragEl).scope().distributioncircuitpoint.id;
        var distributioncircuitid = $scope.currentDistributionCircuit.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DistributionCircuitPointService.deletePair(distributioncircuitid, distributioncircuitpointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant('TOASTER.UNBIND_POINT_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getPointsByDistributionCircuitID($scope.currentDistributionCircuit.id);
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
    $scope.getAllDistributionCircuits();

    $scope.$on('handleBroadcastDistributionCircuitChanged', function (event) {
        $scope.getAllDistributionCircuits();
    });
});
