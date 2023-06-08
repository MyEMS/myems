'use strict';

app.controller('TenantCommandController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    TenantService,
    CommandService,
    TenantCommandService,
    toaster) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentTenant = {selected:undefined};
    $scope.getAllCommands = function() {
		CommandService.getAllCommands(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.commands = response.data;
			} else {
				$scope.commands = [];
			}
		});
	};

    $scope.getCommandsByTenantID = function (id) {
        TenantCommandService.getCommandsByTenantID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenantcommands = response.data;
            } else {
                $scope.tenantcommands = [];
            }
        });
    };

    $scope.changeTenant=function(item,model){
  	  $scope.currentTenant=item;
  	  $scope.currentTenant.selected=model;
  	  $scope.getCommandsByTenantID($scope.currentTenant.id);
    };

    $scope.getAllTenants = function () {
        TenantService.getAllTenants(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenants = response.data;
                $timeout(function () {
                    $scope.getCommandsByTenantID($scope.currentTenant.id);
                }, 1000);
            } else {
                $scope.tenants = [];
            }
        });

    };

    $scope.pairCommand = function (dragEl, dropEl) {
        var commandid = angular.element('#' + dragEl).scope().command.id;
        var tenantid = $scope.currentTenant.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantCommandService.addPair(tenantid, commandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByTenantID($scope.currentTenant.id);
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
        var tenantcommandid = angular.element('#' + dragEl).scope().tenantcommand.id;
        var tenantid = $scope.currentTenant.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantCommandService.deletePair(tenantid, tenantcommandid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMMAND_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCommandsByTenantID($scope.currentTenant.id);
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
    $scope.getAllTenants();

  	$scope.$on('handleBroadcastTenantChanged', function(event) {
      $scope.getAllTenants();
  	});
});
