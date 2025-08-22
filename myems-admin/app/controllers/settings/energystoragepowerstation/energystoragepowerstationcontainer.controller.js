"use strict";

app.controller(
  "EnergyStoragePowerStationContainerController",
  function (
    $scope,
    $window,
    $translate,
    EnergyStoragePowerStationService,
    EnergyStorageContainerService,
    EnergyStoragePowerStationContainerService,
    toaster,
    SweetAlert
  ) {
    $scope.currentEnergyStoragePowerStation = { selected: undefined };
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.getAllEnergyStorageContainers = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerService.getAllEnergyStorageContainers(
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragecontainers = response.data;
          } else {
            $scope.energystoragecontainers = [];
          }
        }
      );
    };

    $scope.getContainersByEnergyStoragePowerStationID = function (id) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStoragePowerStationContainerService.getContainersByEnergyStoragePowerStationID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragepowerstationcontainers = response.data;
          } else {
            $scope.energystoragepowerstationcontainers = [];
          }
        }
      );
    };

    $scope.changeEnergyStoragePowerStation = function (item, model) {
      $scope.currentEnergyStoragePowerStation = item;
      $scope.currentEnergyStoragePowerStation.selected = model;
      $scope.getContainersByEnergyStoragePowerStationID(
        $scope.currentEnergyStoragePowerStation.id
      );
    };

    $scope.getAllEnergyStoragePowerStations = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStoragePowerStationService.getAllEnergyStoragePowerStations(
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragepowerstations = response.data;
          } else {
            $scope.energystoragepowerstations = [];
          }
        }
      );
    };

    $scope.pairEnergyStorageContainer = function (dragEl, dropEl) {
      var energystoragecontainerid = angular.element("#" + dragEl).scope()
        .energystoragecontainer.id;
      var energystoragepowerstationid =
        $scope.currentEnergyStoragePowerStation.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStoragePowerStationContainerService.addPair(
        energystoragepowerstationid,
        energystoragecontainerid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant(
                "TOASTER.BIND_ENERGY_STORAGE_CONTAINER_SUCCESS"
              ),
              showCloseButton: true,
            });
            $scope.getContainersByEnergyStoragePowerStationID(
              $scope.currentEnergyStoragePowerStation.id
            );
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };

    $scope.deleteEnergyStorageContainerPair = function (dragEl, dropEl) {
      if (angular.element("#" + dragEl).hasClass("source")) {
        return;
      }
      var energystoragepowerstationcontainerid = angular
        .element("#" + dragEl)
        .scope().energystoragepowerstationcontainer.id;
      var energystoragepowerstationid =
        $scope.currentEnergyStoragePowerStation.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStoragePowerStationContainerService.deletePair(
        energystoragepowerstationid,
        energystoragepowerstationcontainerid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant(
                "TOASTER.UNBIND_ENERGY_STORAGE_CONTAINER_SUCCESS"
              ),
              showCloseButton: true,
            });
            $scope.getContainersByEnergyStoragePowerStationID(
              $scope.currentEnergyStoragePowerStation.id
            );
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };

    $scope.getAllEnergyStorageContainers();
    $scope.getAllEnergyStoragePowerStations();

    $scope.$on(
      "handleBroadcastEnergyStoragePowerStationChanged",
      function (event) {
        $scope.getAllEnergyStoragePowerStations();
      }
    );
  }
);
