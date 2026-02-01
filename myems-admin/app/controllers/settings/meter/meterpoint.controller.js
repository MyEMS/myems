'use strict';

app.controller('MeterPointController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    MeterService,
    DataSourceService,
    PointService,
    MeterPointService,
    toaster,
    DragDropWarningService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentMeter = {selected:undefined};
    $scope.isMeterSelected = false;
    $scope.meterpoints = [];
    $scope.getAllDataSources = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DataSourceService.getAllDataSources(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.datasources = response.data;
                if ($scope.datasources.length > 0) {
                    $scope.currentDataSource = $scope.datasources[0].id;
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.datasources = [];
            }
        });
    };

    $scope.getPointsByDataSourceID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        PointService.getPointsByDataSourceID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.allPoints = response.data;
                $scope.filterAvailablePoints();
            } else {
                $scope.allPoints = [];
                $scope.filteredPoints = [];
            }
        });
    };

    // Filter out points already bound to the current meter, keeping only available ones for selection
    $scope.filterAvailablePoints = function() {
        var boundSet = {};
        ($scope.meterpoints || []).forEach(function(mp) {
            if (angular.isDefined(mp.id)) {
                boundSet[String(mp.id)] = true;
            }
        });

        $scope.filteredPoints = ($scope.allPoints || []).filter(function(p){
            return !boundSet[String(p.id)];
        });
    };

    $scope.getPointsByMeterID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterPointService.getPointsByMeterID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.meterpoints = response.data;
                $scope.filterAvailablePoints();
            } else {
                $scope.meterpoints = [];
                $scope.filterAvailablePoints();
            }
        });
    };

    $scope.changeMeter=function(item,model){
        $scope.currentMeter=item;
        $scope.currentMeter.selected=model;
        if (item && item.id) {
            $scope.isMeterSelected = true;
            $scope.getPointsByMeterID($scope.currentMeter.id);
            if ($scope.currentDataSource) {
                $scope.getPointsByDataSourceID($scope.currentDataSource);
            }
        } else {
            $scope.isMeterSelected = false;
            $scope.meterpoints = [];
            $scope.filterAvailablePoints();
        }
    };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getAllMeters = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterService.getAllMeters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.meters = response.data;
                $timeout(function () {
                    $scope.getPointsByMeterID($scope.currentMeter.id);
                }, 1000);
            } else {
                $scope.meters = [];
            }
        });

    };

    $scope.pairPoint = function (dragEl, dropEl) {
        if (!$scope.isMeterSelected || !$scope.currentMeter || !$scope.currentMeter.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_METER_FIRST");
            return;
        }
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var meterid = $scope.currentMeter.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterPointService.addPair(meterid, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByMeterID($scope.currentMeter.id);
                $scope.getPointsByDataSourceID($scope.currentDataSource);
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.deletePointPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        if (!$scope.isMeterSelected || !$scope.currentMeter || !$scope.currentMeter.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_METER_FIRST");
            return;
        }
        var meterpointid = angular.element('#' + dragEl).scope().meterpoint.id;
        var meterid = $scope.currentMeter.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterPointService.deletePair(meterid, meterpointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByMeterID($scope.currentMeter.id);
                $scope.getPointsByDataSourceID($scope.currentDataSource);
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.tabInitialized = false;

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllDataSources();
            $scope.getAllMeters();
        }
    };

    $scope.$on('meter.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_POINT) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentMeter && $scope.currentMeter.id) {
                $scope.getPointsByMeterID($scope.currentMeter.id);
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_POINT) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentMeter && $scope.currentMeter.id) {
                $scope.getPointsByMeterID($scope.currentMeter.id);
                if ($scope.currentDataSource) {
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            }
        }
    }, 0);

  	$scope.$on('handleBroadcastMeterChanged', function(event) {
      if ($scope.tabInitialized) {
          $scope.getAllMeters();
          if ($scope.currentMeter && $scope.currentMeter.id) {
              $scope.getPointsByMeterID($scope.currentMeter.id);
              if ($scope.currentDataSource) {
                  $scope.getPointsByDataSourceID($scope.currentDataSource);
              }
          }
      }
  	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'BIND_POINT',
            'SETTING.PLEASE_SELECT_METER_FIRST',
            { BIND_POINT: 1 }
        );
});
