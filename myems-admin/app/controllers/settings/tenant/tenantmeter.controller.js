'use strict';

app.controller('TenantMeterController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    $q,
    MeterService,
    VirtualMeterService,
    OfflineMeterService,
    TenantMeterService,
    TenantService,
    toaster,
    DragDropWarningService) {
    $scope.currentTenant = {selected:undefined};
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.isTenantSelected = false;
	$scope.currentMeterType = "meters";
	$scope.currentmeters = [];
	  $scope.getAllTenants = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantService.getAllTenants(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.tenants = response.data;
				} else {
				$scope.tenants = [];
			 }
		});
	};

	$scope.changeTenant=function(item,model){
		$scope.currentTenant=item;
		$scope.currentTenant.selected=model;
		if (item && item.id) {
		    $scope.isTenantSelected = true;
		    $scope.getMetersByTenantID($scope.currentTenant.id);
		} else {
		    $scope.isTenantSelected = false;
		    $scope.tenantmeters = [];
		    $scope.filterAvailableMeters();
		}
	};

	$scope.getMetersByTenantID = function(id) {
		var metertypes=['meters','virtualmeters','offlinemeters'];
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		var promises = metertypes.map(function(value) {
			var deferred = $q.defer();
			TenantMeterService.getMetersByTenantID(id, value, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					angular.forEach(response.data,function(item,indx){
						response.data[indx].metertype = value;
					});
					deferred.resolve(response.data);
				} else {
					deferred.reject(new Error('Failed to load meters for tenant: ' + value));
				}
			});
			return deferred.promise;
		});

		$q.all(promises).then(function(results) {
			$scope.tenantmeters = [].concat.apply([], results);
			$scope.filterAvailableMeters();
		}).catch(function(error) {
			console.error('Error loading meters:', error);
			$scope.tenantmeters = [];
			$scope.filterAvailableMeters();
		});
	};

	$scope.colorMeterType=function(type){
		if(type=='meters'){
			return 'btn-primary'
		}else if(type=='virtualmeters'){
			return 'btn-info'
		}else{
			return 'btn-success'
		}
	};

	// Filter out meters that are already bound to the current tenant,
	// keeping only available meters for selection
	$scope.filterAvailableMeters = function() {
		var boundSet = {};
		($scope.tenantmeters || []).forEach(function(tm) {
			var keyType = tm.metertype || 'meters';
			if (angular.isDefined(tm.id)) {
				boundSet[keyType + '_' + String(tm.id)] = true;
			}
		});

		$scope.filteredMeters = ($scope.meters || []).filter(function(m){
			return !boundSet['meters_' + String(m.id)];
		});
		$scope.filteredVirtualMeters = ($scope.virtualmeters || []).filter(function(vm){
			return !boundSet['virtualmeters_' + String(vm.id)];
		});
		$scope.filteredOfflineMeters = ($scope.offlinemeters || []).filter(function(om){
			return !boundSet['offlinemeters_' + String(om.id)];
		});

		$scope.changeMeterType();
	};

	$scope.changeMeterType=function(){
		switch($scope.currentMeterType){
			case 'meters':
				$scope.currentmeters=$scope.filteredMeters || [];
				break;
			case 'virtualmeters':
				$scope.currentmeters=$scope.filteredVirtualMeters || [];
				break;
			case  'offlinemeters':
				$scope.currentmeters=$scope.filteredOfflineMeters || [];
				break;
			default:
				$scope.currentmeters = [];
		}
	};


	$scope.getAllMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				$scope.currentMeterType="meters";
				$scope.filterAvailableMeters();
			} else {
				$scope.meters = [];
				$scope.currentmeters = [];
			}
		});

	};


	$scope.getAllOfflineMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		OfflineMeterService.getAllOfflineMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeters = response.data;
				$scope.filterAvailableMeters();
			} else {
				$scope.offlinemeters = [];
			}
		});

	};

	$scope.getAllVirtualMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		VirtualMeterService.getAllVirtualMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.virtualmeters = response.data;
				$scope.filterAvailableMeters();
			} else {
				$scope.virtualmeters = [];
			}
		});

	};

	$scope.pairMeter=function(dragEl,dropEl){
		if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
		    DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
		    return;
		}
		var meterid=angular.element('#'+dragEl).scope().meter.id;
		var tenantid=$scope.currentTenant.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantMeterService.addPair(tenantid, meterid, $scope.currentMeterType, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_METER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMetersByTenantID($scope.currentTenant.id);
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

    $scope.deleteMeterPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
            return;
        }
        var tenantmeterid = angular.element('#' + dragEl).scope().tenantmeter.id;
        var tenantid = $scope.currentTenant.id;
        var metertype = angular.element('#' + dragEl).scope().tenantmeter.metertype;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantMeterService.deletePair(tenantid, tenantmeterid, metertype, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_METER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMetersByTenantID($scope.currentTenant.id);
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

	$scope.getAllTenants();
	$scope.getAllMeters();
	$scope.getAllVirtualMeters();
	$scope.getAllOfflineMeters();

	$scope.$on('handleBroadcastTenantChanged', function(event) {
        $scope.getAllTenants();
        if ($scope.currentTenant && $scope.currentTenant.id) {
            $scope.getMetersByTenantID($scope.currentTenant.id);
        }
	});

    // Listen for tab selection event
    $scope.$on('tenant.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_METER && $scope.currentTenant && $scope.currentTenant.id) {
            $scope.getMetersByTenantID($scope.currentTenant.id);
        }
    });

    // Check on initialization if tab is already active
    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_METER && 
            $scope.currentTenant && $scope.currentTenant.id) {
            $scope.getMetersByTenantID($scope.currentTenant.id);
        }
    }, 0);

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
        $scope,
        'BIND_METER',
        'SETTING.PLEASE_SELECT_TENANT_FIRST',
        { BIND_METER: 2 }
    );

});
