'use strict';

app.controller('StoreMeterController', function($scope,$common ,$timeout,$uibModal, $translate,
													MeterService,
													VirtualMeterService,
													OfflineMeterService,
													StoreMeterService,
													StoreService,
													toaster,SweetAlert) {
    $scope.currentStore = {selected:undefined};

	  $scope.getAllStores = function(id) {
		StoreService.getAllStores(function(error, data) {
			if (!error) {
				$scope.stores = data;
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
			StoreMeterService.getMetersByStoreID(id, value,function(error, data) {
				if (!error) {
					angular.forEach(data,function(item,indx){
						data[indx].metertype=value;
					});
					$scope.storemeters=$scope.storemeters.concat(data);
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
		var storeid=$scope.currentStore.id;
		StoreMeterService.addPair(storeid, meterid, $scope.currentMeterType, function (error, status) {
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

                $scope.getMetersByStoreID($scope.currentStore.id);
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
        var storemeterid = angular.element('#' + dragEl).scope().storemeter.id;
        var storeid = $scope.currentStore.id;
        var metertype = angular.element('#' + dragEl).scope().storemeter.metertype;
        StoreMeterService.deletePair(storeid, storemeterid, metertype, function (error, status) {
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

                $scope.getMetersByStoreID($scope.currentStore.id);
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

	$scope.getAllStores();
	$scope.getAllMeters();
	$scope.getAllVirtualMeters();
	$scope.getAllOfflineMeters();

	$scope.$on('handleBroadcastStoreChanged', function(event) {
    $scope.getAllStores();
	});

});
