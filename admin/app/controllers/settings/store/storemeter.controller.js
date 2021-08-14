'use strict';

app.controller('StoreMeterController', function($scope,$timeout, $translate,
													MeterService,
													VirtualMeterService,
													OfflineMeterService,
													StoreMeterService,
													StoreService,
													toaster) {
    $scope.currentStore = {selected:undefined};

	  $scope.getAllStores = function(id) {
		StoreService.getAllStores(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.stores = response.data;
				} else {
				$scope.stores = [];
			 }
		});
	};

	$scope.changeStore=function(item,model){
		$scope.currentStore=item;
		$scope.currentStore.selected=model;
		$scope.getMetersByStoreID($scope.currentStore.id);
	};

	$scope.getMetersByStoreID = function(id) {
		var metertypes=['meters','virtualmeters','offlinemeters'];
		$scope.storemeters=[];
		angular.forEach(metertypes,function(value,index){
			StoreMeterService.getMetersByStoreID(id, value, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					angular.forEach(response.data,function(item,indx){
						response.data[indx].metertype = value;
					});
					$scope.storemeters=$scope.storemeters.concat(response.data);
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
		var storeid=$scope.currentStore.id;
		StoreMeterService.addPair(storeid, meterid, $scope.currentMeterType, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant(popBody),
                    showCloseButton: true,
                });
                $scope.getMetersByStoreID($scope.currentStore.id);
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
        var storemeterid = angular.element('#' + dragEl).scope().storemeter.id;
        var storeid = $scope.currentStore.id;
        var metertype = angular.element('#' + dragEl).scope().storemeter.metertype;
        StoreMeterService.deletePair(storeid, storemeterid, metertype, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_METER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMetersByStoreID($scope.currentStore.id);
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

	$scope.getAllStores();
	$scope.getAllMeters();
	$scope.getAllVirtualMeters();
	$scope.getAllOfflineMeters();

	$scope.$on('handleBroadcastStoreChanged', function(event) {
    $scope.getAllStores();
	});

});
