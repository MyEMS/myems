"use strict";

app.controller(
  "PhotovoltaicPowerStationDataSourceController",
  function (
    $scope,
    $window,
    $timeout,
    $translate,
    PhotovoltaicPowerStationService,
    DataSourceService,
    PhotovoltaicPowerStationDataSourceService,
    PointService,
    toaster
  ) {
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.currentPhotovoltaicPowerStation = { selected: undefined };

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

    $scope.getDataSourcesByPhotovoltaicPowerStationID = function (id) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      PhotovoltaicPowerStationDataSourceService.getDataSourcesByPhotovoltaicPowerStationID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.photovoltaicpowerstationdatasources = response.data;
          } else {
            $scope.photovoltaicpowerstationdatasources = [];
          }
        }
      );
    };

    $scope.changePhotovoltaicPowerStation = function (item, model) {
      $scope.currentPhotovoltaicPowerStation = item;
      $scope.currentPhotovoltaicPowerStation.selected = model;
      $scope.getDataSourcesByPhotovoltaicPowerStationID(
        $scope.currentPhotovoltaicPowerStation.id
      );
    };

    $scope.getAllPhotovoltaicPowerStations = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      PhotovoltaicPowerStationService.getAllPhotovoltaicPowerStations(
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.photovoltaicpowerstations = response.data;
            $timeout(function () {
              $scope.getDataSourcesByPhotovoltaicPowerStationID(
                $scope.currentPhotovoltaicPowerStation.id
              );
            }, 1000);
          } else {
            $scope.photovoltaicpowerstations = [];
          }
        }
      );
    };

    $scope.pairDataSource = function (dragEl, dropEl) {
      var datasourceid = angular.element("#" + dragEl).scope().datasource.id;
      var photovoltaicpowerstationid = $scope.currentPhotovoltaicPowerStation.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      PhotovoltaicPowerStationDataSourceService.addPair(
        photovoltaicpowerstationid,
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
            $scope.getDataSourcesByPhotovoltaicPowerStationID(
              $scope.currentPhotovoltaicPowerStation.id
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
      var datasourceid = angular
        .element("#" + dragEl)
        .scope().photovoltaicpowerstationdatasource.id;
      var photovoltaicpowerstationid = $scope.currentPhotovoltaicPowerStation.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      PhotovoltaicPowerStationDataSourceService.deletePair(
        photovoltaicpowerstationid,
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
            $scope.getDataSourcesByPhotovoltaicPowerStationID(
              $scope.currentPhotovoltaicPowerStation.id
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
    $scope.getAllPhotovoltaicPowerStations();

    $scope.$on(
      "handleBroadcastPhotovoltaicPowerStationChanged",
      function (event) {
        $scope.getAllPhotovoltaicPowerStations();
      }
    );
  }
);
