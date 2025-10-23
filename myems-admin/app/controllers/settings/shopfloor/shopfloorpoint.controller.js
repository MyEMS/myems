'use strict';
app.controller('ShopfloorPointController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    ShopfloorService,
    DataSourceService,
    PointService,
    ShopfloorPointService,
    toaster,
    SweetAlert
) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentShopfloor = { selected: undefined };

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
                if ($scope.shopfloorpoints && $scope.shopfloorpoints.length > 0) {
                    const boundIds = $scope.shopfloorpoints.map(p => p.id);
                    $scope.points = allPoints.filter(p => !boundIds.includes(p.id));
                } else {
                    $scope.points = allPoints;
                }
            } else {
                $scope.points = [];
            }
        });
    };

    $scope.getPointsByShopfloorID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorPointService.getPointsByShopfloorID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloorpoints = response.data;
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.shopfloorpoints = [];
            }
        });
    };

    $scope.changeShopfloor = function (item, model) {
        $scope.currentShopfloor = item;
        $scope.currentShopfloor.selected = model;
        $scope.getPointsByShopfloorID($scope.currentShopfloor.id);
    };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllShopfloors = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorService.getAllShopfloors(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloors = response.data;
                $timeout(function () {
                    if ($scope.currentShopfloor.id) {
                        $scope.getPointsByShopfloorID($scope.currentShopfloor.id);
                    }
                }, 1000);
            } else {
                $scope.shopfloors = [];
            }
        });
    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorPointService.addPair(shopfloorid, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant('TOASTER.BIND_POINT_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getPointsByShopfloorID($scope.currentShopfloor.id);
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
        var shopfloorpointid = angular.element('#' + dragEl).scope().shopfloorpoint.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorPointService.deletePair(shopfloorid, shopfloorpointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByShopfloorID($scope.currentShopfloor.id);
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
    $scope.getAllShopfloors();

    $scope.$on('handleBroadcastShopfloorChanged', function (event) {
        $scope.getAllShopfloors();
    });
});
