'use strict';

app.controller('MeterCommandController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    MeterService,
    CommandService,
    MeterCommandService,
    toaster) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentMeter = {selected:undefined};
    $scope.getAllCommands = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CommandService.getAllCommands(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.commands = response.data;
			} else {
				$scope.commands = [];
			}
		});
	};

    $scope.getCommandsByMeterID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterCommandService.getCommandsByMeterID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.metercommands = response.data;
            } else {
                $scope.metercommands = [];
            }
        });
    };

    $scope.changeMeter=function(item,model){
  	  $scope.currentMeter=item;
  	  $scope.currentMeter.selected=model;
  	  $scope.getCommandsByMeterID($scope.currentMeter.id);
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

    $scope.$on('meter.tabSelected', function(event, tabIndex) {
        if ($scope.$parent && $scope.$parent.TAB_INDEXES && tabIndex === $scope.$parent.TAB_INDEXES.BIND_COMMAND && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        if ($scope.$parent && $scope.$parent.TAB_INDEXES && $scope.$parent.activeTabIndex === $scope.$parent.TAB_INDEXES.BIND_COMMAND && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);

  	$scope.$on('handleBroadcastMeterChanged', function(event) {
      if ($scope.tabInitialized) {
          $scope.getAllMeters();
      }
  	});
});
