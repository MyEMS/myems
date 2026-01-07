'use strict';

app.controller('TenantCommandController', function (
    $scope,
    $window,
    $translate,
    $timeout,
    TenantService,
    CommandService,
    TenantCommandService,
    toaster,
    DragDropWarningService
) {

    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user")) || {};
    $scope.currentTenant = null;
    $scope.isTenantSelected = false; 
    $scope.tenants = [];
    $scope.tenantcommands = [];
    $scope.commands = [];
    $scope.getAllCommands = function () {
        const headers = { 
            "User-UUID": $scope.cur_user.uuid, 
            "Token": $scope.cur_user.token 
        };
        CommandService.getAllCommands(headers, function (response) {
            $scope.commands = response.status === 200 ? response.data : [];
        });
    };

    $scope.getCommandsByTenantID = function (tenantId) {
        if (!tenantId) {
            toaster.pop('warning', $translate.instant("TOASTER.WARNING_TITLE"), $translate.instant("TOASTER.INVALID_TENANT_ID"));
            return;
        }
        const headers = { 
            "User-UUID": $scope.cur_user.uuid, 
            "Token": $scope.cur_user.token 
        };
        TenantCommandService.getCommandsByTenantID(tenantId, headers, function (response) {
            $scope.tenantcommands = response.status === 200 ? response.data : [];
        });
    };

    $scope.changeTenant = function (item) {
        if (!item || !item.id) {
            $scope.isTenantSelected = false;
            toaster.pop('warning', $translate.instant("TOASTER.WARNING_TITLE"), $translate.instant("TOASTER.PLEASE_SELECT_TENANT"));
            return;
        }
        $scope.currentTenant = item;
        $scope.isTenantSelected = true;
        $scope.getCommandsByTenantID($scope.currentTenant.id);
    };

    $scope.getAllTenants = function () {
        const headers = { 
            "User-UUID": $scope.cur_user.uuid, 
            "Token": $scope.cur_user.token 
        };
        TenantService.getAllTenants(headers, function (response) {
            if (response.status === 200) {
                $scope.tenants = response.data;
                if ($scope.tenants.length > 0) {
                    $scope.currentTenant = $scope.tenants[0];
                    $scope.getCommandsByTenantID($scope.currentTenant.id); 
                } else {
                    $scope.tenantcommands = []; 
                }
            } else {
                $scope.tenants = [];
                $scope.tenantcommands = [];
            }
        });

    };

    $scope.pairCommand = function (dragEl, dropEl) {
        if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
            return;
        }
        const commandId = angular.element('#' + dragEl).scope().command.id;
        const tenantId = $scope.currentTenant.id; 
        if (!commandId || !tenantId) {
            toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), $translate.instant("TOASTER.MISSING_PARAMS"));
            return;
        }
        const headers = { 
            "User-UUID": $scope.cur_user.uuid, 
            "Token": $scope.cur_user.token 
        };
        TenantCommandService.addPair(tenantId, commandId, headers, function (response) {
            if (response.status === 201) {
                toaster.pop('success', $translate.instant("TOASTER.SUCCESS_TITLE"), $translate.instant("TOASTER.BIND_SUCCESS"));
                $scope.getCommandsByTenantID(tenantId); 
            } else {
                toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), response.data?.description || $translate.instant("TOASTER.BIND_FAILED"));
            }
        });
    };
    $scope.deleteCommandPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) return;
        if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
            return;
        }
        const tenantCommandId = angular.element('#' + dragEl).scope().tenantcommand.id;
        const tenantId = $scope.currentTenant.id;
        if (!tenantCommandId || !tenantId) {
            toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), $translate.instant("TOASTER.MISSING_PARAMS"));
            return;
        }
        const headers = { 
            "User-UUID": $scope.cur_user.uuid, 
            "Token": $scope.cur_user.token 
        };
        TenantCommandService.deletePair(tenantId, tenantCommandId, headers, function (response) {
            if (response.status === 204) {
                toaster.pop('success', $translate.instant("TOASTER.SUCCESS_TITLE"), $translate.instant("TOASTER.UNBIND_SUCCESS"));
                $scope.getCommandsByTenantID(tenantId); 
            } else {
                toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), response.data?.description || $translate.instant("TOASTER.UNBIND_FAILED"));
            }
        });
    };
    $scope.getAllTenants(); 
    $scope.getAllCommands(); 
    $scope.$on('handleBroadcastTenantChanged', function (event) {
        $scope.getAllTenants();
    });

    // Listen for disabled drag/drop events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'BIND_COMMAND',
            'SETTING.PLEASE_SELECT_TENANT_FIRST',
            { BIND_COMMAND: 6 }
        );
    });

    $scope.$on('HJC-DROP-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'BIND_COMMAND',
            'SETTING.PLEASE_SELECT_TENANT_FIRST',
            { BIND_COMMAND: 6 }
        );
    });
});
