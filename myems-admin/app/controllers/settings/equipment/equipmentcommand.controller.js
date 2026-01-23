'use strict';

app.controller('EquipmentCommandController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    EquipmentService,
    CommandService,
    EquipmentCommandService,
    toaster,
    DragDropWarningService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentEquipment = {selected:undefined};
    $scope.isEquipmentSelected = false;
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

    $scope.getCommandsByEquipmentID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EquipmentCommandService.getCommandsByEquipmentID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.equipmentcommands = response.data;
                $scope.filterAvailableCommands();
            } else {
                $scope.equipmentcommands = [];
                $scope.filterAvailableCommands();
            }
        });
    };

    // Filter out commands already bound to the current equipment, keeping only available ones for selection
    $scope.filterAvailableCommands = function() {
        var boundSet = {};
        ($scope.equipmentcommands || []).forEach(function(ec) {
            if (angular.isDefined(ec.id)) {
                boundSet[String(ec.id)] = true;
            }
        });

        $scope.filteredCommands = ($scope.commands || []).filter(function(c){
            return !boundSet[String(c.id)];
        });
    };

    $scope.changeEquipment=function(item,model){
  	  $scope.currentEquipment=item;
  	  $scope.currentEquipment.selected=model;
  	  if (item && item.id) {
  	      $scope.isEquipmentSelected = true;
  	      $scope.getCommandsByEquipmentID($scope.currentEquipment.id);
  	  } else {
  	      $scope.isEquipmentSelected = false;
  	      $scope.equipmentcommands = [];
  	      $scope.filterAvailableCommands();
  	  }
    };

    $scope.getAllEquipments = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EquipmentService.getAllEquipments(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.equipments = response.data;
                $timeout(function () {
                    $scope.getCommandsByEquipmentID($scope.currentEquipment.id);
                }, 1000);
            } else {
                $scope.equipments = [];
            }
        });

    };

    $scope.pairCommand = function (dragEl, dropEl) {
        if (!$scope.isEquipmentSelected || !$scope.currentEquipment || !$scope.currentEquipment.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_EQUIPMENT_FIRST");
            return;
        }
        var commandid = angular.element('#' + dragEl).scope().command.id;
        var equipmentid = $scope.currentEquipment.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EquipmentCommandService.addPair(equipmentid, commandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByEquipmentID($scope.currentEquipment.id);
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
        if (!$scope.isEquipmentSelected || !$scope.currentEquipment || !$scope.currentEquipment.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_EQUIPMENT_FIRST");
            return;
        }
        var equipmentcommandid = angular.element('#' + dragEl).scope().equipmentcommand.id;
        var equipmentid = $scope.currentEquipment.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EquipmentCommandService.deletePair(equipmentid, equipmentcommandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByEquipmentID($scope.currentEquipment.id);
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
            $scope.getAllEquipments();
        }
    };

    $scope.$on('equipment.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_COMMAND) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentEquipment && $scope.currentEquipment.id) {
                $scope.getCommandsByEquipmentID($scope.currentEquipment.id);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_COMMAND) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentEquipment && $scope.currentEquipment.id) {
                $scope.getCommandsByEquipmentID($scope.currentEquipment.id);
            }
        }
    }, 0);

  	$scope.$on('handleBroadcastEquipmentChanged', function(event) {
      if ($scope.tabInitialized) {
          $scope.getAllEquipments();
          if ($scope.currentEquipment && $scope.currentEquipment.id) {
              $scope.getCommandsByEquipmentID($scope.currentEquipment.id);
          }
      }
  	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'BIND_COMMAND',
            'SETTING.PLEASE_SELECT_EQUIPMENT_FIRST',
            { BIND_COMMAND: 4 }
        );
});
