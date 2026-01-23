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
                $scope.filterAvailableSensors();
            } else {
                $scope.sensors = [];
                $scope.filteredSensors = [];
            }
        });
    };

    $scope.getSensorsByTenantID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantSensorService.getSensorsByTenantID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenantsensors = response.data;
                $scope.filterAvailableSensors();
            } else {
                $scope.tenantsensors = [];
                $scope.filterAvailableSensors();
            }
        });
    };

    // Filter out sensors that are already bound to the current tenant,
    // keeping only available sensors for selection
    $scope.filterAvailableSensors = function() {
        var boundSet = {};
        ($scope.tenantsensors || []).forEach(function(ts) {
            if (angular.isDefined(ts.id)) {
                boundSet[String(ts.id)] = true;
            }
        });

        $scope.filteredSensors = ($scope.sensors || []).filter(function(s){
            return !boundSet[String(s.id)];
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
  	        $scope.tenantsensors = [];
  	        $scope.filterAvailableSensors();
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
        if ($scope.currentTenant && $scope.currentTenant.id) {
            $scope.getSensorsByTenantID($scope.currentTenant.id);
        }
  	});

    // Listen for tab selection event
    $scope.$on('tenant.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_SENSOR && $scope.currentTenant && $scope.currentTenant.id) {
            $scope.getSensorsByTenantID($scope.currentTenant.id);
        }
    });

    // Check on initialization if tab is already active
    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_SENSOR && 
            $scope.currentTenant && $scope.currentTenant.id) {
            $scope.getSensorsByTenantID($scope.currentTenant.id);
        }
    }, 0);

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
        $scope,
        'BIND_SENSOR',
        'SETTING.PLEASE_SELECT_TENANT_FIRST',
        { BIND_SENSOR: 4 }
    );
});
