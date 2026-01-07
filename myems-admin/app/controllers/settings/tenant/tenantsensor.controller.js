'use strict';

app.controller('TenantSensorController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    TenantService,
    SensorService,
    TenantSensorService,
    toaster,
    SweetAlert,
    DragDropWarningService) {
    $scope.currentTenant = {selected:undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isTenantSelected = false;
    $scope.getAllSensors = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorService.getAllSensors(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensors = response.data;
            } else {
                $scope.sensors = [];
            }
        });
    };

    $scope.getSensorsByTenantID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantSensorService.getSensorsByTenantID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenantsensors = response.data;
            } else {
                $scope.tenantsensors = [];
            }
        });
    };

    $scope.changeTenant=function(item,model){
  	    $scope.currentTenant=item;
  	    $scope.currentTenant.selected=model;
  	    if (item && item.id) {
  	        $scope.isTenantSelected = true;
  	        $scope.getSensorsByTenantID($scope.currentTenant.id);
  	    } else {
  	        $scope.isTenantSelected = false;
  	    }
    };

    $scope.getAllTenants = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantService.getAllTenants(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenants = response.data;
            } else {
                $scope.tenants = [];
            }
        });
    };

    $scope.pairSensor = function (dragEl, dropEl) {
        if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
            return;
        }
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var tenantid = $scope.currentTenant.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantSensorService.addPair(tenantid, sensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByTenantID($scope.currentTenant.id);
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

    $scope.deleteSensorPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
            return;
        }
        var tenantsensorid = angular.element('#' + dragEl).scope().tenantsensor.id;
        var tenantid = $scope.currentTenant.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantSensorService.deletePair(tenantid, tenantsensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByTenantID($scope.currentTenant.id);
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

    $scope.getAllSensors();
    $scope.getAllTenants();

  	$scope.$on('handleBroadcastTenantChanged', function(event) {
      $scope.getAllTenants();
  	});

    // Listen for disabled drag/drop events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'BIND_SENSOR',
            'SETTING.PLEASE_SELECT_TENANT_FIRST',
            { BIND_SENSOR: 4 }
        );
    });

    $scope.$on('HJC-DROP-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'BIND_SENSOR',
            'SETTING.PLEASE_SELECT_TENANT_FIRST',
            { BIND_SENSOR: 4 }
        );
    });
});
