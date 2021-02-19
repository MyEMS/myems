'use strict';

app.controller('StorePointController', function ($scope, $common, $uibModal, $timeout, $translate, StoreService, DataSourceService, PointService, StorePointService,  toaster, SweetAlert) {
    $scope.currentStore = {selected:undefined};
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

    $scope.getPointsByStoreID = function (id) {
        StorePointService.getPointsByStoreID(id, function (error, data) {
            if (!error) {
                $scope.storepoints = data;
            } else {
                $scope.storepoints = [];
            }
        });

    };

  $scope.changeStore=function(item,model){
    	$scope.currentStore=item;
    	$scope.currentStore.selected=model;
    	$scope.getPointsByStoreID($scope.currentStore.id);
  };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllStores = function () {
        StoreService.getAllStores(function (error, data) {
            if (!error) {
                $scope.stores = data;
            } else {
                $scope.stores = [];
            }
        });

    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var storeid = $scope.currentStore.id;
        StorePointService.addPair(storeid, pointid, function (error, status) {
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

                $scope.getPointsByStoreID($scope.currentStore.id);
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
        var storepointid = angular.element('#' + dragEl).scope().storepoint.id;
        var storeid = $scope.currentStore.id;
        StorePointService.deletePair(storeid, storepointid, function (error, status) {
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

                $scope.getPointsByStoreID($scope.currentStore.id);
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
    $scope.getAllStores();

  	$scope.$on('handleBroadcastStoreChanged', function(event) {
      $scope.getAllStores();
  	});
});
