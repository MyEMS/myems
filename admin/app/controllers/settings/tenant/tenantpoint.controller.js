'use strict';

app.controller('TenantPointController', function ($scope, $translate, TenantService, DataSourceService, PointService, TenantPointService,  toaster, SweetAlert) {
    $scope.currentTenant = {selected:undefined};
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

    $scope.getPointsByTenantID = function (id) {
        TenantPointService.getPointsByTenantID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenantpoints = response.data;
            } else {
                $scope.tenantpoints = [];
            }
        });

    };

  $scope.changeTenant=function(item,model){
    	$scope.currentTenant=item;
    	$scope.currentTenant.selected=model;
    	$scope.getPointsByTenantID($scope.currentTenant.id);
  };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllTenants = function () {
        TenantService.getAllTenants(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenants = response.data;
            } else {
                $scope.tenants = [];
            }
        });

    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var tenantid = $scope.currentTenant.id;
        TenantPointService.addPair(tenantid, pointid, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByTenantID($scope.currentTenant.id);
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
        var tenantpointid = angular.element('#' + dragEl).scope().tenantpoint.id;
        var tenantid = $scope.currentTenant.id;
        TenantPointService.deletePair(tenantid, tenantpointid, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByTenantID($scope.currentTenant.id);
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
    $scope.getAllTenants();

  	$scope.$on('handleBroadcastTenantChanged', function(event) {
      $scope.getAllTenants();
  	});
});
