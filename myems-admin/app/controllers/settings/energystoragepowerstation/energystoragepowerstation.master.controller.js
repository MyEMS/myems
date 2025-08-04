"use strict";

app.controller("EnergyStoragePowerStationMasterController", function ($scope) {
  $scope.$on("handleEmitEnergyStoragePowerStationChanged", function (event) {
    $scope.$broadcast("handleBroadcastEnergyStoragePowerStationChanged");
  });
});
