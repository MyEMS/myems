'use strict';

app.controller('MeterCommandController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    MeterService,
    CommandService,
    MeterCommandService,
    toaster,
    DragDropWarningService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentMeter = {selected:undefined};
    $scope.isMeterSelected = false;
    $scope.getAllCommands = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CommandService.getAllCommands(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.commands = response.data;
				$scope.filterAvailableCommands();
			} else {
				$scope.commands = [];
				$scope.filteredCommands = [];
			}
		});
	};

    $scope.getCommandsByMeterID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterCommandService.getCommandsByMeterID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.metercommands = response.data;
                $scope.filterAvailableCommands();
            } else {
                $scope.metercommands = [];
                $scope.filterAvailableCommands();
            }
        });
    };

    $scope.changeMeter=function(item,model){
  	  $scope.currentMeter=item;
  	  $scope.currentMeter.selected=model;
  	  if (item && item.id) {
  	      $scope.isMeterSelected = true;
  	      $scope.getCommandsByMeterID($scope.currentMeter.id);
  	  } else {
  	      $scope.isMeterSelected = false;
  	      $scope.metercommands = [];
  	      $scope.filterAvailableCommands();
  	  }
    };

    $scope.getAllMeters = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterService.getAllMeters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.meters = response.data;
                $timeout(function () {
                    $scope.getCommandsByMeterID($scope.currentMeter.id);
                }, 1000);
            } else {
                $scope.meters = [];
            }
        });

    };

    $scope.pairCommand = function (dragEl, dropEl) {
        if (!$scope.isMeterSelected || !$scope.currentMeter || !$scope.currentMeter.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_METER_FIRST");
            return;
        }
        var commandid = angular.element('#' + dragEl).scope().command.id;
        var meterid = $scope.currentMeter.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterCommandService.addPair(meterid, commandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByMeterID($scope.currentMeter.id);
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

    $scope.deleteCommandPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        if (!$scope.isMeterSelected || !$scope.currentMeter || !$scope.currentMeter.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_METER_FIRST");
            return;
        }
        var metercommandid = angular.element('#' + dragEl).scope().metercommand.id;
        var meterid = $scope.currentMeter.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterCommandService.deletePair(meterid, metercommandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByMeterID($scope.currentMeter.id);
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
            $scope.getAllCommands();
            $scope.getAllMeters();
        }
    };

    $scope.filterAvailableCommands = function() {
        var boundSet = {};
        ($scope.metercommands || []).forEach(function(mc) {
            if (angular.isDefined(mc.id)) {
                boundSet[mc.id] = true;
            }
        });

        $scope.filteredCommands = ($scope.commands || []).filter(function(c){
            return !boundSet[c.id];
        });
    };

    $scope.$on('meter.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_COMMAND) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentMeter && $scope.currentMeter.id) {
                $scope.getCommandsByMeterID($scope.currentMeter.id);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_COMMAND) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentMeter && $scope.currentMeter.id) {
                $scope.getCommandsByMeterID($scope.currentMeter.id);
            }
        }
    }, 0);

  	$scope.$on('handleBroadcastMeterChanged', function(event) {
      if ($scope.tabInitialized) {
          $scope.getAllMeters();
          if ($scope.currentMeter && $scope.currentMeter.id) {
              $scope.getCommandsByMeterID($scope.currentMeter.id);
          }
      }
  	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'BIND_COMMAND',
            'SETTING.PLEASE_SELECT_METER_FIRST',
            { BIND_COMMAND: 6 }
        );
});
