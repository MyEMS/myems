'use strict';

// Cost Center Emission Factor controller - emission factor association

app.controller('CostCenterEmissionFactorController', function (
    $scope,
    $window,
    $translate,
    CostCenterService,
    EmissionFactorService,
    CostCenterEmissionFactorService,
    toaster
) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

    // Load all cost centers from API
    $scope.getAllCostCenters = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CostCenterService.getAllCostCenters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.costcenters = response.data;
                if ($scope.costcenters.length > 0) {
                    $scope.currentCostCenter = $scope.costcenters[0];
                    $scope.getEmissionFactorsByCostCenterID($scope.currentCostCenter.id);
                }
            } else {
                $scope.costcenters = [];
            }
        });
    };

    // Load emission factors by cost center id
    $scope.getEmissionFactorsByCostCenterID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CostCenterEmissionFactorService.getEmissionFactorsByCostCenterID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.costcenteremissionfactors = response.data;
                $scope.getAllEmissionFactors();
            } else {
                $scope.costcenteremissionfactors = [];
                $scope.getAllEmissionFactors();
            }
        });
    };

    // Handle cost center change
    $scope.changeCostCenter = function () {
        $scope.getEmissionFactorsByCostCenterID($scope.currentCostCenter.id);
    };

    // Load all emission factors from API
    $scope.getAllEmissionFactors = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EmissionFactorService.getAllEmissionFactors(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allEmissionFactors = response.data;
                if ($scope.costcenteremissionfactors && $scope.costcenteremissionfactors.length > 0) {
                    const boundIds = $scope.costcenteremissionfactors.map(t => t.id);
                    $scope.emissionfactors = allEmissionFactors.filter(t => !boundIds.includes(t.id));
                } else {
                    $scope.emissionfactors = allEmissionFactors;
                }
            } else {
                $scope.emissionfactors = [];
            }
        });
    };

    // Bind emission factor via drag-and-drop
    $scope.pairEmissionFactor = function (dragEl, dropEl) {
        var emissionfactorid = angular.element('#' + dragEl).scope().emissionfactor.id;
        var costcenterid = $scope.currentCostCenter.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CostCenterEmissionFactorService.addPair(costcenterid, emissionfactorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {
                        template: $translate.instant("TOASTER.BIND_EMISSION_FACTOR_SUCCESS")
                    }),
                    showCloseButton: true,
                });
                $scope.getEmissionFactorsByCostCenterID($scope.currentCostCenter.id);
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

    // Unbind emission factor via drag-to-trash
    $scope.deleteEmissionFactorPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var costcenteremissionfactorid = angular.element('#' + dragEl).scope().costcenteremissionfactor.id;
        var costcenterid = $scope.currentCostCenter.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CostCenterEmissionFactorService.deletePair(costcenterid, costcenteremissionfactorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {
                        template: $translate.instant("TOASTER.UNBIND_EMISSION_FACTOR_SUCCESS")
                    }),
                    showCloseButton: true,
                });

                $scope.getEmissionFactorsByCostCenterID($scope.currentCostCenter.id);
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
    $scope.getAllEmissionFactors();

    $scope.$on('handleBroadcastCostCenterChanged', function (event) {
        $scope.getAllCostCenters();
    });
});