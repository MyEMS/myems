'use strict';

app.controller('StorePointController', function ($scope, $translate, StoreService, DataSourceService, PointService, StorePointService,  toaster, SweetAlert) {
    $scope.currentStore = {selected:undefined};
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

    $scope.getPointsByStoreID = function (id) {
        StorePointService.getPointsByStoreID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.storepoints = response.data;
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
        StoreService.getAllStores(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.stores = response.data;
            } else {
                $scope.stores = [];
            }
        });

    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var storeid = $scope.currentStore.id;
        StorePointService.addPair(storeid, pointid, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByStoreID($scope.currentStore.id);
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
        var storepointid = angular.element('#' + dragEl).scope().storepoint.id;
        var storeid = $scope.currentStore.id;
        StorePointService.deletePair(storeid, storepointid, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByStoreID($scope.currentStore.id);
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
    $scope.getAllStores();

  	$scope.$on('handleBroadcastStoreChanged', function(event) {
      $scope.getAllStores();
  	});
});
