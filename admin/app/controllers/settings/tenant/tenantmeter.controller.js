'use strict';

app.controller('TenantMeterController', function($scope,$common ,$timeout,$uibModal, $translate,
													MeterService,
													VirtualMeterService,
													OfflineMeterService,
													TenantMeterService,
													TenantService,
													toaster,SweetAlert) {
    $scope.currentTenant = {selected:undefined};

	  $scope.getAllTenants = function(id) {
		TenantService.getAllTenants(function(error, data) {
			if (!error) {
				$scope.tenants = data;
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
			TenantMeterService.getMetersByTenantID(id, value,function(error, data) {
				if (!error) {
					angular.forEach(data,function(item,indx){
						data[indx].metertype=value;
					});
					$scope.tenantmeters=$scope.tenantmeters.concat(data);
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
		MeterService.getAllMeters(function(error, data) {
			if (!error) {
				$scope.meters = data;
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
		OfflineMeterService.getAllOfflineMeters(function(error, data) {
			if (!error) {
				$scope.offlinemeters = data;
			} else {
				$scope.offlinemeters = [];
			}
		});

	};

	$scope.getAllVirtualMeters = function() {
		VirtualMeterService.getAllVirtualMeters(function(error, data) {
			if (!error) {
				$scope.virtualmeters = data;
			} else {
				$scope.virtualmeters = [];
			}
		});

	};

	$scope.pairMeter=function(dragEl,dropEl){
		var meterid=angular.element('#'+dragEl).scope().meter.id;
		var tenantid=$scope.currentTenant.id;
		TenantMeterService.addPair(tenantid, meterid, $scope.currentMeterType, function (error, status) {
            if (angular.isDefined(status) && status == 201) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.BIND_METER_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getMetersByTenantID($scope.currentTenant.id);
            } else {

                var popType = 'TOASTER.ERROR';
                var popTitle = error.title;
                var popBody = error.description;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
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
        TenantMeterService.deletePair(tenantid, tenantmeterid, metertype, function (error, status) {
            if (angular.isDefined(status) && status == 204) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.UNBIND_METER_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getMetersByTenantID($scope.currentTenant.id);
            } else {
                var popType = 'TOASTER.ERROR';
                var popTitle = error.title;
                var popBody = error.description;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
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
