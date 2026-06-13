"use strict";

// Energy Storage Container master controller - coordinates tab events between child controllers

app.controller("EnergyStorageContainerMasterController", function ($scope) {
  $scope.$on("handleEmitEnergyStorageContainerChanged", function (event) {
    $scope.$broadcast("handleBroadcastEnergyStorageContainerChanged");
  });
});
