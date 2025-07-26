"use strict";

app.controller("EnergyStorageContainerMasterController", function ($scope) {
  $scope.$on("handleEmitEnergyStorageContainerChanged", function (event) {
    $scope.$broadcast("handleBroadcastEnergyStorageContainerChanged");
  });
});
