'use strict';

app.controller('ShopfloorMeterController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    MeterService,
	VirtualMeterService,
	OfflineMeterService,
	ShopfloorMeterService,
	ShopfloorService,
	toaster) {
    $scope.currentShopfloor = {selected:undefined};
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	  
	$scope.getAllShopfloors = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ShopfloorService.getAllShopfloors(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.shopfloors = response.data;
			} else {
				$scope.shopfloors = [];
			}
		});
	};

	$scope.changeShopfloor = function(item, model){
		$scope.currentShopfloor = item;
		$scope.currentShopfloor.selected = model;
		$scope.getMetersByShopfloorID($scope.currentShopfloor.id);
	};

	$scope.getMetersByShopfloorID = function(id) {
		var metertypes = ['meters','virtualmeters','offlinemeters'];
		$scope.shopfloormeters = [];
		angular.forEach(metertypes,function(value){
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			ShopfloorMeterService.getMetersByShopfloorID(id, headers, value, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					angular.forEach(response.data, function (item, indx){
						response.data[indx].metertype = value;
					});
					$scope.shopfloormeters = $scope.shopfloormeters.concat(response.data);
					$scope.filterAvailableMeters();
				}
			});
		});
	};

	$scope.colorMeterType = function(type){
		if(type=='meters'){
			return 'btn-primary';
		}else if(type=='virtualmeters'){
			return 'btn-info';
		}else{
			return 'btn-success';
		}
	};

	$scope.changeMeterType = function(){
		switch($scope.currentMeterType){
			case 'meters':
				$scope.currentmeters = $scope.meters;
				break;
			case 'virtualmeters':
				$scope.currentmeters = $scope.virtualmeters;
				break;
			case 'offlinemeters':
				$scope.currentmeters = $scope.offlinemeters;
				break;
		}
		$scope.filterAvailableMeters();
	};

	$scope.filterAvailableMeters = function() {
		if (!$scope.shopfloormeters) return;
		var boundIds = $scope.shopfloormeters.map(x => x.id);
		if ($scope.meters) {
			$scope.meters = $scope.meters.filter(x => !boundIds.includes(x.id));
		}
		if ($scope.virtualmeters) {
			$scope.virtualmeters = $scope.virtualmeters.filter(x => !boundIds.includes(x.id));
		}
		if ($scope.offlinemeters) {
			$scope.offlinemeters = $scope.offlinemeters.filter(x => !boundIds.includes(x.id));
		}
		$scope.changeMeterType();
	};

	$scope.getAllMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				$scope.currentMeterType = "meters";
				$timeout(function(){
					$scope.changeMeterType();
				},100);
			} else {
				$scope.meters = [];
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

	$scope.pairMeter = function(dragEl, dropEl){
		var meterid = angular.element('#' + dragEl).scope().meter.id;
		var shopfloorid = $scope.currentShopfloor.id;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ShopfloorMeterService.addPair(shopfloorid, meterid, $scope.currentMeterType, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.BIND_METER_SUCCESS"),
					showCloseButton: true,
				});
				$scope.getMetersByShopfloorID($scope.currentShopfloor.id);
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
		if (angular.element('#' + dragEl).hasClass('source')) return;
		var shopfloormeterid = angular.element('#' + dragEl).scope().shopfloormeter.id;
		var shopfloorid = $scope.currentShopfloor.id;
		var metertype = angular.element('#' + dragEl).scope().shopfloormeter.metertype;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ShopfloorMeterService.deletePair(shopfloorid, shopfloormeterid, metertype, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 204) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.UNBIND_METER_SUCCESS"),
					showCloseButton: true,
				});
				$scope.getMetersByShopfloorID($scope.currentShopfloor.id);
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

	$scope.getAllShopfloors();
	$scope.getAllMeters();
	$scope.getAllVirtualMeters();
	$scope.getAllOfflineMeters();

	$scope.$on('handleBroadcastShopfloorChanged', function() {
		$scope.getAllShopfloors();
	});
});
