'use strict';

app.controller('CombinedEquipmentCommandController', function (
    $scope,
	$window,
    $timeout,
    $translate,
    CombinedEquipmentService,
    CommandService,
    CombinedEquipmentCommandService,
    toaster) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentCombinedEquipment = {selected:undefined};
    $scope.getAllCommands = function() {
		CommandService.getAllCommands(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.commands = response.data;
			} else {
				$scope.commands = [];
			}
		});
	};

    $scope.getCommandsByCombinedEquipmentID = function (id) {
        CombinedEquipmentCommandService.getCommandsByCombinedEquipmentID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.combinedequipmentcommands = response.data;
            } else {
                $scope.combinedequipmentcommands = [];
            }
        });
    };

    $scope.changeCombinedEquipment=function(item,model){
  	  $scope.currentCombinedEquipment=item;
  	  $scope.currentCombinedEquipment.selected=model;
  	  $scope.getCommandsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
    };

    $scope.getAllCombinedEquipments = function () {
        CombinedEquipmentService.getAllCombinedEquipments(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.combinedequipments = response.data;
                $timeout(function () {
                    $scope.getCommandsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
                }, 1000);
            } else {
                $scope.combinedequipments = [];
            }
        });

    };

    $scope.pairCommand = function (dragEl, dropEl) {
        var commandid = angular.element('#' + dragEl).scope().command.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentCommandService.addPair(combinedequipmentid, commandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
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
        var combinedequipmentcommandid = angular.element('#' + dragEl).scope().combinedequipmentcommand.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentCommandService.deletePair(combinedequipmentid, combinedequipmentcommandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
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
    $scope.getAllCombinedEquipments();

  	$scope.$on('handleBroadcastCombinedEquipmentChanged', function(event) {
      $scope.getAllCombinedEquipments();
  	});
});
