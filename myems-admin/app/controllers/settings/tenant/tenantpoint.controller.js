'use strict';

app.controller('TenantPointController', function (
    $scope, 
    $window,
    $timeout,
    $translate, 
    TenantService, 
    DataSourceService, 
    PointService, 
    TenantPointService,  
    toaster, 
    SweetAlert,
    DragDropWarningService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentTenant = {selected:undefined};
    $scope.isTenantSelected = false;
    $scope.getAllDataSources = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DataSourceService.getAllDataSources(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.datasources = response.data;
                if ($scope.datasources.length > 0) {
                    $scope.currentDataSource = $scope.datasources[0].id;
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.datasources = [];
            }
        });
    };

    $scope.getPointsByDataSourceID = function (id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        PointService.getPointsByDataSourceID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.points = response.data;
                $scope.filterAvailablePoints();
            } else {
                $scope.points = [];
                $scope.filteredPoints = [];
            }
        });
    };

    $scope.getPointsByTenantID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantPointService.getPointsByTenantID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenantpoints = response.data;
                $scope.filterAvailablePoints();
            } else {
                $scope.tenantpoints = [];
                $scope.filterAvailablePoints();
            }
        });

    };

    // Filter out points already bound to the current tenant, keeping only available ones for selection
    $scope.filterAvailablePoints = function() {
        var boundSet = {};
        ($scope.tenantpoints || []).forEach(function(tp) {
            if (angular.isDefined(tp.id)) {
                boundSet[String(tp.id)] = true;
            }
        });

        $scope.filteredPoints = ($scope.points || []).filter(function(p){
            return !boundSet[String(p.id)];
        });
    };

  $scope.changeTenant=function(item,model){
    	$scope.currentTenant=item;
    	$scope.currentTenant.selected=model;
    	if (item && item.id) {
    	    $scope.isTenantSelected = true;
    	    $scope.getPointsByTenantID($scope.currentTenant.id);
    	} else {
    	    $scope.isTenantSelected = false;
    	    $scope.tenantpoints = [];
    	    $scope.filterAvailablePoints();
    	}
  };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
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

    $scope.pairPoint = function (dragEl, dropEl) {
        if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
            return;
        }
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var tenantid = $scope.currentTenant.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantPointService.addPair(tenantid, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByTenantID($scope.currentTenant.id);
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

    $scope.deletePointPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
            return;
        }
        var tenantpointid = angular.element('#' + dragEl).scope().tenantpoint.id;
        var tenantid = $scope.currentTenant.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantPointService.deletePair(tenantid, tenantpointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsByTenantID($scope.currentTenant.id);
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

    $scope.getAllDataSources();
    $scope.getAllTenants();

  	$scope.$on('handleBroadcastTenantChanged', function(event) {
        $scope.getAllTenants();
        if ($scope.currentTenant && $scope.currentTenant.id) {
            $scope.getPointsByTenantID($scope.currentTenant.id);
        }
  	});

    // Listen for tab selection event
    $scope.$on('tenant.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_POINT && $scope.currentTenant && $scope.currentTenant.id) {
            $scope.getPointsByTenantID($scope.currentTenant.id);
        }
    });

    // Check on initialization if tab is already active
    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_POINT && 
            $scope.currentTenant && $scope.currentTenant.id) {
            $scope.getPointsByTenantID($scope.currentTenant.id);
        }
    }, 0);

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
        $scope,
        'BIND_POINT',
        'SETTING.PLEASE_SELECT_TENANT_FIRST',
        { BIND_POINT: 3 }
    );
});
