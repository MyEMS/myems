'use strict';

app.controller('TenantPointController', function ($scope, $common, $uibModal, $timeout, $translate, TenantService, DataSourceService, PointService, TenantPointService,  toaster, SweetAlert) {
    $scope.currentTenant = {selected:undefined};
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

    $scope.getPointsByTenantID = function (id) {
        TenantPointService.getPointsByTenantID(id, function (error, data) {
            if (!error) {
                $scope.tenantpoints = data;
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
        TenantService.getAllTenants(function (error, data) {
            if (!error) {
                $scope.tenants = data;
            } else {
                $scope.tenants = [];
            }
        });

    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var tenantid = $scope.currentTenant.id;
        TenantPointService.addPair(tenantid, pointid, function (error, status) {
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

                $scope.getPointsByTenantID($scope.currentTenant.id);
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
        var tenantpointid = angular.element('#' + dragEl).scope().tenantpoint.id;
        var tenantid = $scope.currentTenant.id;
        TenantPointService.deletePair(tenantid, tenantpointid, function (error, status) {
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

                $scope.getPointsByTenantID($scope.currentTenant.id);
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
    $scope.getAllTenants();

  	$scope.$on('handleBroadcastTenantChanged', function(event) {
      $scope.getAllTenants();
  	});
});
