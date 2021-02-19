'use strict';

app.controller('ShopfloorMeterController', function($scope,$common ,$timeout,$uibModal, $translate,
													MeterService,
													VirtualMeterService,
													OfflineMeterService,
													ShopfloorMeterService,
													ShopfloorService,
													toaster,SweetAlert) {
    $scope.currentShopfloor = {selected:undefined};

	  $scope.getAllShopfloors = function(id) {
		ShopfloorService.getAllShopfloors(function(error, data) {
			if (!error) {
				$scope.shopfloors = data;
				} else {
				$scope.shopfloors = [];
			 }
		});
	};

	$scope.changeShopfloor=function(item,model){
		$scope.currentShopfloor=item;
		$scope.currentShopfloor.selected=model;
		$scope.getMetersByShopfloorID($scope.currentShopfloor.id);
	};

	$scope.getMetersByShopfloorID = function(id) {
		var metertypes=['meters','virtualmeters','offlinemeters'];
		$scope.shopfloormeters=[];
		angular.forEach(metertypes,function(value,index){
			ShopfloorMeterService.getMetersByShopfloorID(id, value,function(error, data) {
				if (!error) {
					angular.forEach(data,function(item,indx){
						data[indx].metertype=value;
					});
					$scope.shopfloormeters=$scope.shopfloormeters.concat(data);
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
		var shopfloorid=$scope.currentShopfloor.id;
		ShopfloorMeterService.addPair(shopfloorid, meterid, $scope.currentMeterType, function (error, status) {
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

                $scope.getMetersByShopfloorID($scope.currentShopfloor.id);
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
        var shopfloormeterid = angular.element('#' + dragEl).scope().shopfloormeter.id;
        var shopfloorid = $scope.currentShopfloor.id;
        var metertype = angular.element('#' + dragEl).scope().shopfloormeter.metertype;
        ShopfloorMeterService.deletePair(shopfloorid, shopfloormeterid, metertype, function (error, status) {
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

                $scope.getMetersByShopfloorID($scope.currentShopfloor.id);
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

	$scope.getAllShopfloors();
	$scope.getAllMeters();
	$scope.getAllVirtualMeters();
	$scope.getAllOfflineMeters();

	$scope.$on('handleBroadcastShopfloorChanged', function(event) {
    $scope.getAllShopfloors();
	});

});
