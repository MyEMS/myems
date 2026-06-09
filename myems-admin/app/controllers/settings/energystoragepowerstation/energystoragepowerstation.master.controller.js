"use strict";

// Energy Storage Power Station master controller - coordinates tab events between child controllers

app.controller("EnergyStoragePowerStationMasterController", function ($scope) {
  $scope.$on("handleEmitEnergyStoragePowerStationChanged", function (event) {
    $scope.$broadcast("handleBroadcastEnergyStoragePowerStationChanged");
  });
});
