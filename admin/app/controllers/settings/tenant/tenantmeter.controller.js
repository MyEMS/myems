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
	  $scope.getAllTenants = function(id) {
		TenantService.getAllTenants(function (response) {
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
		$scope.getMetersByTenantID($scope.currentTenant.id);
	};

	$scope.getMetersByTenantID = function(id) {
		var metertypes=['meters','virtualmeters','offlinemeters'];
		$scope.tenantmeters=[];
		angular.forEach(metertypes,function(value,index){
			TenantMeterService.getMetersByTenantID(id, value, function (response) {
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
				$scope.currentmeters=$scope.meters;
				break;
			case 'virtualmeters':
				$scope.currentmeters=$scope.virtualmeters;
				break;
			case  'offlinemeters':
				$scope.currentmeters=$scope.offlinemeters;
				break;
		}
	};


	$scope.getAllMeters = function() {
		MeterService.getAllMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				$scope.currentMeterType="meters";
				$timeout(function(){
					$scope.changeMeterType();
				},1000);
			} else {
				$scope.meters = [];
			}
		});

	};


	$scope.getAllOfflineMeters = function() {
		OfflineMeterService.getAllOfflineMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeters = response.data;
			} else {
				$scope.offlinemeters = [];
			}
		});

	};

	$scope.getAllVirtualMeters = function() {
		VirtualMeterService.getAllVirtualMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.virtualmeters = response.data;
			} else {
				$scope.virtualmeters = [];
			}
		});

	};

	$scope.pairMeter=function(dragEl,dropEl){
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
                    title: $translate.instant(erresponse.dataror.title),
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

});
