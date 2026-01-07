'use strict';

app.controller('CombinedEquipmentCommandController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    CombinedEquipmentService,
    CommandService,
    CombinedEquipmentCommandService,
    toaster,
    DragDropWarningService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentCombinedEquipment = {selected:undefined};
    $scope.isCombinedEquipmentSelected = false;
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

    $scope.getCommandsByCombinedEquipmentID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentCommandService.getCommandsByCombinedEquipmentID(id, headers, function (response) {
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
  	  if (item && item.id) {
  	      $scope.isCombinedEquipmentSelected = true;
  	      $scope.getCommandsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
  	  } else {
  	      $scope.isCombinedEquipmentSelected = false;
  	  }
    };

    $scope.getAllCombinedEquipments = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentService.getAllCombinedEquipments(headers, function (response) {
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
        if (!$scope.isCombinedEquipmentSelected || !$scope.currentCombinedEquipment || !$scope.currentCombinedEquipment.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST");
            return;
        }
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
        if (!$scope.isCombinedEquipmentSelected || !$scope.currentCombinedEquipment || !$scope.currentCombinedEquipment.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST");
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

    $scope.tabInitialized = false;

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllCommands();
            $scope.getAllCombinedEquipments();
        }
    };

    $scope.$on('combinedequipment.tabSelected', function(event, tabIndex) {
        if ($scope.$parent && $scope.$parent.TAB_INDEXES && tabIndex === $scope.$parent.TAB_INDEXES.BIND_COMMAND && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        if ($scope.$parent && $scope.$parent.TAB_INDEXES && $scope.$parent.activeTabIndex === $scope.$parent.TAB_INDEXES.BIND_COMMAND && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);

  	$scope.$on('handleBroadcastCombinedEquipmentChanged', function(event) {
      if ($scope.tabInitialized) {
          $scope.getAllCombinedEquipments();
      }
  	});

    // Listen for disabled drag/drop events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'BIND_COMMAND',
            'SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST',
            { BIND_COMMAND: 5 }
        );
    });

    $scope.$on('HJC-DROP-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'BIND_COMMAND',
            'SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST',
            { BIND_COMMAND: 5 }
        );
    });
});
