"use strict";

app.controller(
  "MicrogridDataSourceController",
  function (
    $scope,
    $window,
    $timeout,
    $translate,
    MicrogridService,
    DataSourceService,
    MicrogridDataSourceService,
    PointService,
    toaster
  ) {
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.currentMicrogrid = { selected: undefined };

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

    $scope.getDataSourcesByMicrogridID = function (id) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      MicrogridDataSourceService.getDataSourcesByMicrogridID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.microgriddatasources = response.data;
          } else {
            $scope.microgriddatasources = [];
          }
        }
      );
    };

    $scope.changeMicrogrid = function (item, model) {
      $scope.currentMicrogrid = item;
      $scope.currentMicrogrid.selected = model;
      $scope.getDataSourcesByMicrogridID(
        $scope.currentMicrogrid.id
      );
    };

    $scope.getAllMicrogrids = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      MicrogridService.getAllMicrogrids(
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.microgrids = response.data;
            $timeout(function () {
              $scope.getDataSourcesByMicrogridID(
                $scope.currentMicrogrid.id
              );
            }, 1000);
          } else {
            $scope.microgrids = [];
          }
        }
      );
    };

    $scope.pairDataSource = function (dragEl, dropEl) {
      var datasourceid = angular.element("#" + dragEl).scope().datasource.id;
      var microgridid = $scope.currentMicrogrid.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      MicrogridDataSourceService.addPair(
        microgridid,
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
            $scope.getDataSourcesByMicrogridID(
              $scope.currentMicrogrid.id
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
        .scope().microgriddatasource.id;
      var microgridid = $scope.currentMicrogrid.id;
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
        "API-KEY": $scope.cur_user.api_key
      };
      MicrogridDataSourceService.deletePair(
        microgridid,
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
            $scope.getDataSourcesByMicrogridID(
              $scope.currentMicrogrid.id
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
    $scope.getAllMicrogrids();

    $scope.$on(
      "handleBroadcastMicrogridChanged",
      function (event) {
        $scope.getAllMicrogrids();
      }
    );
  }
);