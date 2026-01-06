'use strict';

app.controller('TenantMeterController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    MeterService,
    VirtualMeterService,
    OfflineMeterService,
    TenantMeterService,
    TenantService,
    toaster) {
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
		}
	};

	$scope.getMetersByTenantID = function(id) {
		var metertypes=['meters','virtualmeters','offlinemeters'];
		$scope.tenantmeters=[];
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		angular.forEach(metertypes,function(value,index){
			TenantMeterService.getMetersByTenantID(id, value, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					angular.forEach(response.data,function(item,indx){
						response.data[indx].metertype = value;
					});
					$scope.tenantmeters=$scope.tenantmeters.concat(response.data);
				}
			});
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

	$scope.changeMeterType=function(){
		switch($scope.currentMeterType){
			case 'meters':
				$scope.currentmeters=$scope.meters || [];
				break;
			case 'virtualmeters':
				$scope.currentmeters=$scope.virtualmeters || [];
				break;
			case  'offlinemeters':
				$scope.currentmeters=$scope.offlinemeters || [];
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
				$scope.changeMeterType();
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
				if ($scope.currentMeterType === 'offlinemeters') {
					$scope.changeMeterType();
				}
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
				if ($scope.currentMeterType === 'virtualmeters') {
					$scope.changeMeterType();
				}
			} else {
				$scope.virtualmeters = [];
			}
		});

	};

	$scope.pairMeter=function(dragEl,dropEl){
		if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
		    toaster.pop({
		        type: "warning",
		        body: $translate.instant("SETTING.PLEASE_SELECT_TENANT_FIRST"),
		        showCloseButton: true,
		    });
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
            toaster.pop({
                type: "warning",
                body: $translate.instant("SETTING.PLEASE_SELECT_TENANT_FIRST"),
                showCloseButton: true,
            });
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
	});

    // Listen for disabled drag/drop events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { BIND_METER: 2 };
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_METER) {
            $timeout(function() {
                try {
                    toaster.pop({
                        type: "warning",
                        body: $translate.instant("SETTING.PLEASE_SELECT_TENANT_FIRST"),
                        showCloseButton: true,
                    });
                } catch(err) {
                    console.error('Error showing toaster:', err);
                    alert($translate.instant("SETTING.PLEASE_SELECT_TENANT_FIRST"));
                }
            }, 0);
        }
    });

    $scope.$on('HJC-DROP-DISABLED', function(event) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { BIND_METER: 2 };
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_METER) {
            $timeout(function() {
                try {
                    toaster.pop({
                        type: "warning",
                        body: $translate.instant("SETTING.PLEASE_SELECT_TENANT_FIRST"),
                        showCloseButton: true,
                    });
                } catch(err) {
                    console.error('Error showing toaster:', err);
                    alert($translate.instant("SETTING.PLEASE_SELECT_TENANT_FIRST"));
                }
            }, 0);
        }
    });

});
