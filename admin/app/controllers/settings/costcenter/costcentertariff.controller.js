'use strict';

app.controller('CostCenterTariffController', function ($scope,  $translate,$common, $uibModal, $timeout,
                                                       CostCenterService,
                                                       TariffService,
                                                       CostCenterTariffService,
                                                       toaster, SweetAlert) {

    $scope.getAllCostCenters = function () {
        CostCenterService.getAllCostCenters(function (error, data) {
            if (!error) {
                $scope.costcenters = data;
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
        CostCenterTariffService.getTariffsByCostCenterID(id, function (error, data) {
            if (!error) {
                $scope.costcentertariffs = data;
            } else {
                $scope.costcentertariffs = [];
            }
        });

    };

    $scope.changeCostCenter = function () {
        $scope.getTariffsByCostCenterID($scope.currentCostCenter.id);
    };


    $scope.getAllTariffs = function () {
        TariffService.getAllTariffs(function (error, data) {
            if (!error) {
                $scope.tariffs = data;
            } else {
                $scope.tariffs = [];
            }
        });

    };

    $scope.pairTariff = function (dragEl, dropEl) {
        var tariffid = angular.element('#' + dragEl).scope().tariff.id;
        var costcenterid = $scope.currentCostCenter.id;
        CostCenterTariffService.addPair(costcenterid, tariffid, function (error, status) {
            if (angular.isDefined(status) && status == 201) {
                var templateName = "TOASTER.BIND_TARIFF_SUCCESS";
                templateName = $translate.instant(templateName);

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = $common.toaster.success_add_body;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody, {template: templateName});

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getTariffsByCostCenterID($scope.currentCostCenter.id);
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

    $scope.deleteTariffPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var costcentertariffid = angular.element('#' + dragEl).scope().costcentertariff.id;
        var costcenterid = $scope.currentCostCenter.id;
        CostCenterTariffService.deletePair(costcenterid, costcentertariffid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {
                var templateName = "TOASTER.UNBIND_TARIFF_SUCCESS";
                templateName = $translate.instant(templateName);

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = $common.toaster.success_delete_body;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody, {template: templateName});

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getTariffsByCostCenterID($scope.currentCostCenter.id);
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


    $scope.getAllCostCenters();
    $scope.getAllTariffs();

  	$scope.$on('handleBroadcastCostCenterChanged', function(event) {
  		$scope.getAllCostCenters();
  	});

});
