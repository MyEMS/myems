"use strict";

// Energy Storage Power Station User controller - user association

app.controller(
  "EnergyStoragePowerStationUserController",
  function (
    $scope,
    $window,
    $translate,
    EnergyStoragePowerStationService,
    UserService,
    EnergyStoragePowerStationUserService,
    toaster,
    SweetAlert
  ) {
    $scope.currentEnergyStoragePowerStation = { selected: undefined };
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    // Load all users from API
    $scope.getAllUsers = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      UserService.getAllUsers(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.users = response.data;
        } else {
          $scope.users = [];
        }
      });
    };

    // Load users by energy storage power station id
    $scope.getUsersByEnergyStoragePowerStationID = function (id) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStoragePowerStationUserService.getUsersByEnergyStoragePowerStationID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragepowerstationusers = response.data;
          } else {
            $scope.energystoragepowerstationusers = [];
          }
        }
      );
    };

    // Handle energy storage power station change
    $scope.changeEnergyStoragePowerStation = function (item, model) {
      $scope.currentEnergyStoragePowerStation = item;
      $scope.currentEnergyStoragePowerStation.selected = model;
      $scope.getUsersByEnergyStoragePowerStationID(
        $scope.currentEnergyStoragePowerStation.id
      );
    };

    // Load all energy storage power stations from API
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

    // Bind user via drag-and-drop
    $scope.pairUser = function (dragEl, dropEl) {
      var userid = angular.element("#" + dragEl).scope().user.id;
      var energystoragepowerstationid =
        $scope.currentEnergyStoragePowerStation.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStoragePowerStationUserService.addPair(
        energystoragepowerstationid,
        userid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.BIND_USER_SUCCESS"),
              showCloseButton: true,
            });
            $scope.getUsersByEnergyStoragePowerStationID(
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

    // Unbind user via drag-to-trash
    $scope.deleteUserPair = function (dragEl, dropEl) {
      if (angular.element("#" + dragEl).hasClass("source")) {
        return;
      }
      var energystoragepowerstationuserid = angular
        .element("#" + dragEl)
        .scope().energystoragepowerstationuser.id;
      var energystoragepowerstationid =
        $scope.currentEnergyStoragePowerStation.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStoragePowerStationUserService.deletePair(
        energystoragepowerstationid,
        energystoragepowerstationuserid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.UNBIND_USER_SUCCESS"),
              showCloseButton: true,
            });
            $scope.getUsersByEnergyStoragePowerStationID(
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

    $scope.getAllUsers();
    $scope.getAllEnergyStoragePowerStations();

    $scope.$on(
      "handleBroadcastEnergyStoragePowerStationChanged",
      function (event) {
        $scope.getAllEnergyStoragePowerStations();
      }
    );
  }
);
