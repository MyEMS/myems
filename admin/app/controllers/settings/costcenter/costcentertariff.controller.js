'use strict';

app.controller('CostCenterTariffController', function ($scope,  $translate,
                                                       CostCenterService,
                                                       TariffService,
                                                       CostCenterTariffService,
                                                       toaster) {

    $scope.getAllCostCenters = function () {
        CostCenterService.getAllCostCenters(function (response) {
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

    $scope.getTariffsByCostCenterID = function (id) {
        CostCenterTariffService.getTariffsByCostCenterID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.costcentertariffs = response.data;
            } else {
                $scope.costcentertariffs = [];
            }
        });

    };

    $scope.changeCostCenter = function () {
        $scope.getTariffsByCostCenterID($scope.currentCostCenter.id);
    };


    $scope.getAllTariffs = function () {
        TariffService.getAllTariffs(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tariffs = response.data;
            } else {
                $scope.tariffs = [];
            }
        });

    };

    $scope.pairTariff = function (dragEl, dropEl) {
        var tariffid = angular.element('#' + dragEl).scope().tariff.id;
        var costcenterid = $scope.currentCostCenter.id;
        CostCenterTariffService.addPair(costcenterid, tariffid, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("TOASTER.BIND_TARIFF_SUCCESS")}),
                    showCloseButton: true,
                });
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

    $scope.deleteTariffPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var costcentertariffid = angular.element('#' + dragEl).scope().costcentertariff.id;
        var costcenterid = $scope.currentCostCenter.id;
        CostCenterTariffService.deletePair(costcenterid, costcentertariffid, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: popTi$translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("TOASTER.UNBIND_TARIFF_SUCCESS")}),
                    showCloseButton: true,
                });

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


    $scope.getAllCostCenters();
    $scope.getAllTariffs();

  	$scope.$on('handleBroadcastCostCenterChanged', function(event) {
  		$scope.getAllCostCenters();
  	});

});
