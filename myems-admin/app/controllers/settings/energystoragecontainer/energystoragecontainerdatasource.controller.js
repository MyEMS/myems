"use strict";

app.controller(
  "EnergyStorageContainerDataSourceController",
  function (
    $scope,
    $rootScope,
    $window,
    $timeout,
    $translate,
    EnergyStorageContainerService,
    DataSourceService,
    EnergyStorageContainerDataSourceService,
    PointService,
    toaster,
    DragDropWarningService
  ) {
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.currentEnergyStorageContainer = { selected: undefined };
    $scope.isEnergyStorageContainerSelected = false;

    $scope.getAllDataSources = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      DataSourceService.getAllDataSources(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.datasources = response.data;
        } else {
          $scope.datasources = [];
        }
      });
    };

    $scope.getDataSourcesByEnergyStorageContainerID = function (id) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerDataSourceService.getDataSourcesByEnergyStorageContainerID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragecontainerdatasources = response.data;
          } else {
            $scope.energystoragecontainerdatasources = [];
          }
        }
      );
    };

    $scope.changeEnergyStorageContainer = function (item, model) {
      $scope.currentEnergyStorageContainer = item;
      $scope.currentEnergyStorageContainer.selected = model;
      if ($scope.currentEnergyStorageContainer && $scope.currentEnergyStorageContainer.id) {
        $scope.isEnergyStorageContainerSelected = true;
        $scope.getDataSourcesByEnergyStorageContainerID(
          $scope.currentEnergyStorageContainer.id
        );
      } else {
        $scope.isEnergyStorageContainerSelected = false;
      }
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
              if ($scope.currentEnergyStorageContainer && $scope.currentEnergyStorageContainer.id) {
                $scope.isEnergyStorageContainerSelected = true;
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
              }
            }, 1000);
          } else {
            $scope.energystoragecontainers = [];
          }
        }
      );
    };

    $scope.pairDataSource = function (dragEl, dropEl) {
      var datasourceid = angular.element("#" + dragEl).scope().datasource.id;
      var energystoragecontainerid = $scope.currentEnergyStorageContainer.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerDataSourceService.addPair(
        energystoragecontainerid,
        datasourceid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.BIND_DATASOURCE_SUCCESS"),
              showCloseButton: true,
            });
            $scope.getDataSourcesByEnergyStorageContainerID(
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

    $scope.deleteDataSourcePair = function (dragEl, dropEl) {
      if (angular.element("#" + dragEl).hasClass("source")) {
        return;
      }
      var energystoragecontainerdatasourceid = angular
        .element("#" + dragEl)
        .scope().energystoragecontainerdatasource.id;
      var energystoragecontainerid = $scope.currentEnergyStorageContainer.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerDataSourceService.deletePair(
        energystoragecontainerid,
        energystoragecontainerdatasourceid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.UNBIND_DATASOURCE_SUCCESS"),
              showCloseButton: true,
            });
            $scope.getDataSourcesByEnergyStorageContainerID(
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

    $scope.getAllDataSources();
    $scope.getAllEnergyStorageContainers();

    $scope.$on(
      "handleBroadcastEnergyStorageContainerChanged",
      function (event) {
        $scope.getAllEnergyStorageContainers();
      }
    );

    // Listen directly to HJC-DRAG-DISABLED event and show warning
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
      if (!$scope.isEnergyStorageContainerSelected) {
        // Use rootScope flag to prevent multiple warnings from different controllers
        if (!$rootScope._energyStorageContainerDragWarningShown) {
          $rootScope._energyStorageContainerDragWarningShown = true;
          DragDropWarningService.showWarning('SETTING.PLEASE_SELECT_ENERGY_STORAGE_CONTAINER_FIRST');
          $timeout(function() {
            $rootScope._energyStorageContainerDragWarningShown = false;
          }, 500); // Reset flag after 500ms
        }
      }
    });
  }
);
