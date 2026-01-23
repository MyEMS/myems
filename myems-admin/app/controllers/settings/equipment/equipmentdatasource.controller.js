"use strict";

app.controller(
  "EquipmentDataSourceController",
  function (
    $scope,
    $window,
    $timeout,
    $translate,
    EquipmentService,
    DataSourceService,
    EquipmentDataSourceService,
    PointService,
    toaster,
    DragDropWarningService
  ) {
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.currentEquipment = { selected: undefined };
    $scope.isEquipmentSelected = false;

    $scope.getAllDataSources = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      DataSourceService.getAllDataSources(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.datasources = response.data;
          $scope.filterAvailableDataSources();
        } else {
          $scope.datasources = [];
          $scope.filteredDataSources = [];
        }
      });
    };

    $scope.getDataSourcesByEquipmentID = function (id) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      EquipmentDataSourceService.getDataSourcesByEquipmentID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.equipmentdatasources = response.data;
            $scope.filterAvailableDataSources();
          } else {
            $scope.equipmentdatasources = [];
            $scope.filterAvailableDataSources();
          }
        }
      );
    };

    // Filter out data sources that are already bound to the current equipment,
    // keeping only available data sources for selection
    $scope.filterAvailableDataSources = function() {
      var boundSet = {};
      ($scope.equipmentdatasources || []).forEach(function(eds) {
        if (angular.isDefined(eds.id)) {
          boundSet[String(eds.id)] = true;
        }
      });

      $scope.filteredDataSources = ($scope.datasources || []).filter(function(ds){
        return !boundSet[String(ds.id)];
      });
    };

    $scope.changeEquipment = function (item, model) {
      $scope.currentEquipment = item;
      $scope.currentEquipment.selected = model;
      if (item && item.id) {
        $scope.isEquipmentSelected = true;
        $scope.getDataSourcesByEquipmentID(
          $scope.currentEquipment.id
        );
      } else {
        $scope.isEquipmentSelected = false;
        $scope.equipmentdatasources = [];
        $scope.filterAvailableDataSources();
      }
    };

    $scope.getAllEquipments = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      EquipmentService.getAllEquipments(
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.equipments = response.data;
            $timeout(function () {
              $scope.getDataSourcesByEquipmentID(
                $scope.currentEquipment.id
              );
            }, 1000);
          } else {
            $scope.equipments = [];
          }
        }
      );
    };

    $scope.pairDataSource = function (dragEl, dropEl) {
      if (!$scope.isEquipmentSelected || !$scope.currentEquipment || !$scope.currentEquipment.id) {
        DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_EQUIPMENT_FIRST");
        return;
      }
      var datasourceid = angular.element("#" + dragEl).scope().datasource.id;
      var equipmentid = $scope.currentEquipment.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      EquipmentDataSourceService.addPair(
        equipmentid,
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
            $scope.getDataSourcesByEquipmentID(
              $scope.currentEquipment.id
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
      if (!$scope.isEquipmentSelected || !$scope.currentEquipment || !$scope.currentEquipment.id) {
        DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_EQUIPMENT_FIRST");
        return;
      }
      var datasourceid = angular
        .element("#" + dragEl)
        .scope().equipmentdatasource.id;
      var equipmentid = $scope.currentEquipment.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      EquipmentDataSourceService.deletePair(
        equipmentid,
        datasourceid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.UNBIND_DATASOURCE_SUCCESS"),
              showCloseButton: true,
            });
            $scope.getDataSourcesByEquipmentID(
              $scope.currentEquipment.id
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

    $scope.tabInitialized = false;

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllDataSources();
            $scope.getAllEquipments();
        }
    };

    $scope.$on('equipment.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_DATA_SOURCE) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentEquipment && $scope.currentEquipment.id) {
                $scope.getDataSourcesByEquipmentID($scope.currentEquipment.id);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_DATA_SOURCE) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentEquipment && $scope.currentEquipment.id) {
                $scope.getDataSourcesByEquipmentID($scope.currentEquipment.id);
            }
        }
    }, 0);

    $scope.$on(
      "handleBroadcastEquipmentChanged",
      function (event) {
        if ($scope.tabInitialized) {
            $scope.getAllEquipments();
            if ($scope.currentEquipment && $scope.currentEquipment.id) {
                $scope.getDataSourcesByEquipmentID($scope.currentEquipment.id);
            }
        }
      }
    );

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'BIND_DATA_SOURCE',
            'SETTING.PLEASE_SELECT_EQUIPMENT_FIRST',
            { BIND_DATA_SOURCE: 2 }
        );
  }
);
