'use strict';
app.controller('StorePointController', function (
    $window,
    $scope,
    $timeout,
    $translate,
    StoreService,
    DataSourceService,
    PointService,
    StorePointService,
    toaster,
    SweetAlert,
    DragDropWarningService
) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentStore = { selected: undefined };
    $scope.isStoreSelected = false;

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
                if ($scope.storepoints && $scope.storepoints.length > 0) {
                    const boundIds = $scope.storepoints.map(p => p.id);
                    $scope.points = allPoints.filter(p => !boundIds.includes(p.id));
                } else {
                    $scope.points = allPoints;
                }
            } else {
                $scope.points = [];
            }
        });
    };

    $scope.getPointsByStoreID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StorePointService.getPointsByStoreID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.storepoints = response.data;
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.storepoints = [];
            }
        });
    };

    $scope.changeStore = function (item, model) {
        $scope.currentStore = item;
        $scope.currentStore.selected = model;
        if (item && item.id) {
            $scope.isStoreSelected = true;
            $scope.getPointsByStoreID($scope.currentStore.id);
        } else {
            $scope.isStoreSelected = false;
        }
    };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllStores = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreService.getAllStores(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.stores = response.data;
                $timeout(function () {
                    if ($scope.currentStore.id) {
                        $scope.getPointsByStoreID($scope.currentStore.id);
                    }
                }, 1000);
            } else {
                $scope.stores = [];
            }
        });
    };

    $scope.pairPoint = function (dragEl, dropEl) {
        if (!$scope.isStoreSelected || !$scope.currentStore || !$scope.currentStore.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_STORE_FIRST");
            return;
        }
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StorePointService.addPair(storeid, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant('TOASTER.BIND_POINT_SUCCESS'),
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
        if (!$scope.isStoreSelected || !$scope.currentStore || !$scope.currentStore.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_STORE_FIRST");
            return;
        }
        var storepointid = angular.element('#' + dragEl).scope().storepoint.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StorePointService.deletePair(storeid, storepointid, headers, function (response) {
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

    $scope.$on('handleBroadcastStoreChanged', function (event) {
        $scope.getAllStores();
    });

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'BIND_POINT',
            'SETTING.PLEASE_SELECT_STORE_FIRST',
            { BIND_POINT: 2 }
        );
});
