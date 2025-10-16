'use strict';

app.controller('CostCenterTariffController', function (
    $scope,
    $window,
    $translate,
    CostCenterService,
    TariffService,
    CostCenterTariffService,
    toaster
) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

    // 获取所有成本中心
    $scope.getAllCostCenters = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CostCenterService.getAllCostCenters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.costcenters = response.data;
                if ($scope.costcenters.length > 0) {
                    $scope.currentCostCenter = $scope.costcenters[0];
                    $scope.getTariffsByCostCenterID($scope.currentCostCenter.id);
                }
            } else {
                $scope.costcenters = [];
            }
        });
    };

    // 根据成本中心ID获取绑定费率
    $scope.getTariffsByCostCenterID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CostCenterTariffService.getTariffsByCostCenterID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.costcentertariffs = response.data;
                // 重新加载未绑定费率列表（右侧）
                $scope.getAllTariffs();
            } else {
                $scope.costcentertariffs = [];
                $scope.getAllTariffs();
            }
        });
    };

    // 切换成本中心
    $scope.changeCostCenter = function () {
        $scope.getTariffsByCostCenterID($scope.currentCostCenter.id);
    };

    // 获取所有费率（右侧未绑定列表）
    $scope.getAllTariffs = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TariffService.getAllTariffs(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allTariffs = response.data;
                if ($scope.costcentertariffs && $scope.costcentertariffs.length > 0) {
                    const boundIds = $scope.costcentertariffs.map(t => t.id);
                    // 过滤掉已绑定的费率
                    $scope.tariffs = allTariffs.filter(t => !boundIds.includes(t.id));
                } else {
                    $scope.tariffs = allTariffs;
                }
            } else {
                $scope.tariffs = [];
            }
        });
    };

    // 绑定费率
    $scope.pairTariff = function (dragEl, dropEl) {
        var tariffid = angular.element('#' + dragEl).scope().tariff.id;
        var costcenterid = $scope.currentCostCenter.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CostCenterTariffService.addPair(costcenterid, tariffid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {
                        template: $translate.instant("TOASTER.BIND_TARIFF_SUCCESS")
                    }),
                    showCloseButton: true,
                });
                // 刷新绑定与未绑定列表
                $scope.getTariffsByCostCenterID($scope.currentCostCenter.id);
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

    // 解绑费率
    $scope.deleteTariffPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var costcentertariffid = angular.element('#' + dragEl).scope().costcentertariff.id;
        var costcenterid = $scope.currentCostCenter.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CostCenterTariffService.deletePair(costcenterid, costcentertariffid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {
                        template: $translate.instant("TOASTER.UNBIND_TARIFF_SUCCESS")
                    }),
                    showCloseButton: true,
                });
                // 刷新绑定与未绑定列表
                $scope.getTariffsByCostCenterID($scope.currentCostCenter.id);
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

    // 初始化加载
    $scope.getAllCostCenters();
    $scope.getAllTariffs();

    // 当其他控制器广播更新时刷新
    $scope.$on('handleBroadcastCostCenterChanged', function (event) {
        $scope.getAllCostCenters();
    });
});
