'use strict';

app.controller('StoreCommandController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    StoreService,
    CommandService,
    StoreCommandService,
    toaster) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentStore = {selected:undefined};
    $scope.getAllCommands = function() {
		CommandService.getAllCommands(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.commands = response.data;
			} else {
				$scope.commands = [];
			}
		});
	};

    $scope.getCommandsByStoreID = function (id) {
        StoreCommandService.getCommandsByStoreID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.storecommands = response.data;
            } else {
                $scope.storecommands = [];
            }
        });
    };

    $scope.changeStore=function(item,model){
  	  $scope.currentStore=item;
  	  $scope.currentStore.selected=model;
  	  $scope.getCommandsByStoreID($scope.currentStore.id);
    };

    $scope.getAllStores = function () {
        StoreService.getAllStores(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.stores = response.data;
                $timeout(function () {
                    $scope.getCommandsByStoreID($scope.currentStore.id);
                }, 1000);
            } else {
                $scope.stores = [];
            }
        });

    };

    $scope.pairCommand = function (dragEl, dropEl) {
        var commandid = angular.element('#' + dragEl).scope().command.id;
        var storeid = $scope.currentStore.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreCommandService.addPair(storeid, commandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByStoreID($scope.currentStore.id);
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
        var storecommandid = angular.element('#' + dragEl).scope().storecommand.id;
        var storeid = $scope.currentStore.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreCommandService.deletePair(storeid, storecommandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByStoreID($scope.currentStore.id);
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
    $scope.getAllStores();

  	$scope.$on('handleBroadcastStoreChanged', function(event) {
      $scope.getAllStores();
  	});
});
