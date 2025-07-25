"use strict";

app.controller(
  "EnergyStorageContainerCommandController",
  function (
    $scope,
    $window,
    $timeout,
    $translate,
    EnergyStorageContainerService,
    CommandService,
    EnergyStorageContainerCommandService,
	PointService,
    toaster
  ) {
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.currentEnergyStorageContainer = { selected: undefined };
    $scope.getAllCommands = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      CommandService.getAllCommands(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.commands = response.data;
        } else {
          $scope.commands = [];
        }
      });
    };

    $scope.getCommandsByEnergyStorageContainerID = function (id) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerCommandService.getCommandsByEnergyStorageContainerID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragecontainercommands = response.data;
          } else {
            $scope.energystoragecontainercommands = [];
          }
        }
      );
    };

    $scope.changeEnergyStorageContainer = function (item, model) {
      $scope.currentEnergyStorageContainer = item;
      $scope.currentEnergyStorageContainer.selected = model;
      $scope.getCommandsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
    };

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
            $timeout(function () {
              $scope.getCommandsByEnergyStorageContainerID(
                $scope.currentEnergyStorageContainer.id
              );
            }, 1000);
          } else {
            $scope.energystoragecontainers = [];
          }
        }
      );
    };

    $scope.pairCommand = function (dragEl, dropEl) {
      var commandid = angular.element("#" + dragEl).scope().command.id;
      var energystoragecontainerid = $scope.currentEnergyStorageContainer.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerCommandService.addPair(
        energystoragecontainerid,
        commandid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
              showCloseButton: true,
            });
            $scope.getCommandsByEnergyStorageContainerID(
              $scope.currentEnergyStorageContainer.id
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

    $scope.deleteCommandPair = function (dragEl, dropEl) {
      if (angular.element("#" + dragEl).hasClass("source")) {
        return;
      }
      var energystoragecontainercommandid = angular
        .element("#" + dragEl)
        .scope().energystoragecontainercommand.id;
      var energystoragecontainerid = $scope.currentEnergyStorageContainer.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerCommandService.deletePair(
        energystoragecontainerid,
        energystoragecontainercommandid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
              showCloseButton: true,
            });
            $scope.getCommandsByEnergyStorageContainerID(
              $scope.currentEnergyStorageContainer.id
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

    $scope.getAllCommands();
    $scope.getAllEnergyStorageContainers();

    $scope.$on(
      "handleBroadcastEnergyStorageContainerChanged",
      function (event) {
        $scope.getAllEnergyStorageContainers();
      }
    );
  }
);
