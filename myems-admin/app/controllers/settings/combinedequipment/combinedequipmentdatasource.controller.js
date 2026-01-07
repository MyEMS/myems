"use strict";

app.controller(
  "CombinedEquipmentDataSourceController",
  function (
    $scope,
    $rootScope,
    $window,
    $timeout,
    $translate,
    CombinedEquipmentService,
    DataSourceService,
    CombinedEquipmentDataSourceService,
    toaster,
    DragDropWarningService
  ) {
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.currentCombinedEquipment = { selected: undefined };
    $scope.isCombinedEquipmentSelected = false;

    $scope.getAllDataSources = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      DataSourceService.getAllDataSources(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.datasources = response.data;
        } else {
          $scope.datasources = [];
        }
      });
    };

    $scope.getDataSourcesByCombinedEquipmentID = function (id) {
      if (!id) {
        $scope.combinedequipmentdatasources = [];
        return;
      }
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      CombinedEquipmentDataSourceService.getDataSourcesByCombinedEquipmentID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.combinedequipmentdatasources = response.data;
          } else {
            $scope.combinedequipmentdatasources = [];
          }
        }
      );
    };

    $scope.changeCombinedEquipment = function (item, model) {
      $scope.currentCombinedEquipment = item;
      $scope.currentCombinedEquipment.selected = model;
      if ($scope.currentCombinedEquipment && $scope.currentCombinedEquipment.id) {
        $scope.isCombinedEquipmentSelected = true;
        $scope.getDataSourcesByCombinedEquipmentID(
          $scope.currentCombinedEquipment.id
        );
      } else {
        $scope.isCombinedEquipmentSelected = false;
      }
    };

    $scope.getAllCombinedEquipments = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      CombinedEquipmentService.getAllCombinedEquipments(
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.combinedequipments = response.data;
            if ($scope.currentCombinedEquipment && $scope.currentCombinedEquipment.id) {
              $timeout(function () {
                $scope.getDataSourcesByCombinedEquipmentID(
                  $scope.currentCombinedEquipment.id
                );
              }, 1000);
            }
          } else {
            $scope.combinedequipments = [];
          }
        }
      );
    };

    $scope.pairDataSource = function (dragEl, dropEl) {
      if (!$scope.isCombinedEquipmentSelected || !$scope.currentCombinedEquipment || !$scope.currentCombinedEquipment.id) {
        toaster.pop({
          type: "warning",
          body: $translate.instant("SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST"),
          showCloseButton: true,
        });
        return;
      }
      var datasourceid = angular.element("#" + dragEl).scope().datasource.id;
      var combinedequipmentid = $scope.currentCombinedEquipment.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      CombinedEquipmentDataSourceService.addPair(
        combinedequipmentid,
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
            $scope.getDataSourcesByCombinedEquipmentID(
              $scope.currentCombinedEquipment.id
            );
            $rootScope.$broadcast("handleBroadcastCombinedEquipmentDataSourceChanged", {
              combinedEquipmentId: combinedequipmentid
            });
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
      if (!dragEl) {
        return;
      }
      
      var dragElement = angular.element("#" + dragEl);
      if (!dragElement || !dragElement.length) {
        return;
      }
      
      if (dragElement.hasClass("source")) {
        return;
      }
      
      if (!$scope.isCombinedEquipmentSelected || !$scope.currentCombinedEquipment || !$scope.currentCombinedEquipment.id) {
        DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST");
        return;
      }
      
      try {
        var dragScope = dragElement.scope();
        if (!dragScope) {
          return;
        }
        
        if (!dragScope.combinedequipmentdatasource) {
          return;
        }
        
        if (!dragScope.combinedequipmentdatasource.id) {
          return;
        }
        
        var datasourceid = dragScope.combinedequipmentdatasource.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
        
        if (!combinedequipmentid || !datasourceid) {
          return;
        }
        
        let headers = {
          "User-UUID": $scope.cur_user.uuid,
          Token: $scope.cur_user.token,
          "API-KEY": $scope.cur_user.api_key
        };
        
        CombinedEquipmentDataSourceService.deletePair(
          combinedequipmentid,
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
              $scope.getDataSourcesByCombinedEquipmentID(
                $scope.currentCombinedEquipment.id
              );
              $rootScope.$broadcast("handleBroadcastCombinedEquipmentDataSourceChanged", {
                combinedEquipmentId: combinedequipmentid
              });
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
      } catch (e) {
        console.error("Error in deleteDataSourcePair:", e);
        return;
      }
    };

    $scope.tabInitialized = false;

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllDataSources();
            $scope.getAllCombinedEquipments();
        }
    };

    $scope.$on('combinedequipment.tabSelected', function(event, tabIndex) {
        if ($scope.$parent && $scope.$parent.TAB_INDEXES && tabIndex === $scope.$parent.TAB_INDEXES.BIND_DATA_SOURCE && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        if ($scope.$parent && $scope.$parent.TAB_INDEXES && $scope.$parent.activeTabIndex === $scope.$parent.TAB_INDEXES.BIND_DATA_SOURCE && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);

    $scope.$on(
      "handleBroadcastCombinedEquipmentChanged",
      function (event) {
        if ($scope.tabInitialized) {
            $scope.getAllCombinedEquipments();
        }
      }
    );

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
        $scope,
        'BIND_DATA_SOURCE',
        'SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST',
        { BIND_DATA_SOURCE: 3 }
    );
  }
);
