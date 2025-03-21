'use strict';

app.controller('HybridPowerStationCommandController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    HybridPowerStationService,
    CommandService,
    HybridPowerStationCommandService,
    toaster) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentHybridPowerStation = {selected:undefined};
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

    $scope.getCommandsByHybridPowerStationID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        HybridPowerStationCommandService.getCommandsByHybridPowerStationID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.hybridpowerstationcommands = response.data;
            } else {
                $scope.hybridpowerstationcommands = [];
            }
        });
    };

    $scope.changeHybridPowerStation=function(item,model){
  	  $scope.currentHybridPowerStation=item;
  	  $scope.currentHybridPowerStation.selected=model;
  	  $scope.getCommandsByHybridPowerStationID($scope.currentHybridPowerStation.id);
    };

    $scope.getAllHybridPowerStations = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        HybridPowerStationService.getAllHybridPowerStations(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.hybridpowerstations = response.data;
                $timeout(function () {
                    $scope.getCommandsByHybridPowerStationID($scope.currentHybridPowerStation.id);
                }, 1000);
            } else {
                $scope.hybridpowerstations = [];
            }
        });

    };

    $scope.pairCommand = function (dragEl, dropEl) {
        var commandid = angular.element('#' + dragEl).scope().command.id;
        var hybridpowerstationid = $scope.currentHybridPowerStation.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        HybridPowerStationCommandService.addPair(hybridpowerstationid, commandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByHybridPowerStationID($scope.currentHybridPowerStation.id);
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
        var hybridpowerstationcommandid = angular.element('#' + dragEl).scope().hybridpowerstationcommand.id;
        var hybridpowerstationid = $scope.currentHybridPowerStation.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        HybridPowerStationCommandService.deletePair(hybridpowerstationid, hybridpowerstationcommandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByHybridPowerStationID($scope.currentHybridPowerStation.id);
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

    $scope.getAllCommands();
    $scope.getAllHybridPowerStations();

  	$scope.$on('handleBroadcastHybridPowerStationChanged', function(event) {
      $scope.getAllHybridPowerStations();
  	});
});
