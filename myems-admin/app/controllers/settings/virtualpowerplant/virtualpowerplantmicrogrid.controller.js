'use strict';

app.controller('VirtualPowerPlantMicrogridController', function (
    $scope,
    $window,
    $translate,
    VirtualPowerPlantService,
    MicrogridService,
    VirtualPowerPlantMicrogridService,
    toaster,
    SweetAlert) {
    $scope.currentVirtualPowerPlant = {selected:undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.getAllMicrogrids = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridService.getAllMicrogrids(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.microgrids = response.data;
            } else {
                $scope.microgrids = [];
            }
        });
    };

    $scope.getMicrogridsByVirtualPowerPlantID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        VirtualPowerPlantMicrogridService.getMicrogridsByVirtualPowerPlantID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.virtualpowerplantmicrogrids = response.data;
            } else {
                $scope.virtualpowerplantmicrogrids = [];
            }
        });
    };

    $scope.changeVirtualPowerPlant=function(item,model){
        $scope.currentVirtualPowerPlant=item;
        $scope.currentVirtualPowerPlant.selected=model;
        $scope.getMicrogridsByVirtualPowerPlantID($scope.currentVirtualPowerPlant.id);
    };

    $scope.getAllVirtualPowerPlants = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        VirtualPowerPlantService.getAllVirtualPowerPlants(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.virtualpowerplants = response.data;
            } else {
                $scope.virtualpowerplants = [];
            }
        });
    };

    $scope.pairMicrogrid = function (dragEl, dropEl) {
        var microgridid = angular.element('#' + dragEl).scope().microgrid.id;
        var virtualpowerplantid = $scope.currentVirtualPowerPlant.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        VirtualPowerPlantMicrogridService.addPair(virtualpowerplantid, microgridid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_MICROGRID_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMicrogridsByVirtualPowerPlantID($scope.currentVirtualPowerPlant.id);
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

    $scope.deleteMicrogridPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var virtualpowerplantmicrogridid = angular.element('#' + dragEl).scope().virtualpowerplantmicrogrid.id;
        var virtualpowerplantid = $scope.currentVirtualPowerPlant.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        VirtualPowerPlantMicrogridService.deletePair(virtualpowerplantid, virtualpowerplantmicrogridid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_MICROGRID_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMicrogridsByVirtualPowerPlantID($scope.currentVirtualPowerPlant.id);
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

    $scope.getAllMicrogrids();
    $scope.getAllVirtualPowerPlants();

  	$scope.$on('handleBroadcastVirtualPowerPlantChanged', function(event) {
      $scope.getAllVirtualPowerPlants();
  	});
});
