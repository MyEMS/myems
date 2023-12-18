'use strict';

app.controller('EnergyStoragePowerStationBatteryController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStoragePowerStationService,
	EnergyStoragePowerStationBatteryService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.energystoragepowerstations = [];
      $scope.energystoragepowerstationbatteries = [];
	  $scope.points = [];
	  $scope.meters = [];
      $scope.currentEnergyStoragePowerStation = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.getAllEnergyStoragePowerStations = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStoragePowerStationService.getAllEnergyStoragePowerStations(headers, function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.energystoragepowerstations = response.data;
  			} else {
  				$scope.energystoragepowerstations = [];
  			}
  		});
  	};

	$scope.getAllPoints = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		PointService.getAllPoints(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.points = response.data;
			} else {
				$scope.points = [];
			}
		});
	};

	$scope.getAllMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
			} else {
				$scope.meters = [];
			}
		});
	};

  	$scope.getEnergyStoragePowerStationBatteriesByEnergyStoragePowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStoragePowerStationBatteryService.getEnergyStoragePowerStationBatteriesByEnergyStoragePowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragepowerstationbatteries = response.data;
			} else {
          	$scope.energystoragepowerstationbatteries=[];
        }
			});
  	};

  	$scope.changeEnergyStoragePowerStation=function(item,model){
    	$scope.currentEnergyStoragePowerStation=item;
    	$scope.currentEnergyStoragePowerStation.selected=model;
        $scope.is_show_add_energystoragepowerstation_battery = true;
    	$scope.getEnergyStoragePowerStationBatteriesByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
  	};

  	$scope.addEnergyStoragePowerStationBattery = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstationbattery.model.html',
  			controller: 'ModalAddEnergyStoragePowerStationBatteryCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energystoragepowerstationbattery) {
        	energystoragepowerstationbattery.battery_state_point_id = energystoragepowerstationbattery.battery_state_point.id;
			energystoragepowerstationbattery.soc_point_id = energystoragepowerstationbattery.soc_point.id;
			energystoragepowerstationbattery.power_point_id = energystoragepowerstationbattery.power_point.id;
			energystoragepowerstationbattery.charge_meter_id = energystoragepowerstationbattery.charge_meter.id;
			energystoragepowerstationbattery.discharge_meter_id = energystoragepowerstationbattery.discharge_meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStoragePowerStationBatteryService.addEnergyStoragePowerStationBattery($scope.currentEnergyStoragePowerStation.id, energystoragepowerstationbattery, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStoragePowerStationBatteriesByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
            		$scope.$emit('handleEmitEnergyStoragePowerStationBatteryChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStoragePowerStationBattery = function(energystoragepowerstationbattery) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstationbattery.model.html',
  			controller: 'ModalEditEnergyStoragePowerStationBatteryCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragepowerstationbattery: angular.copy(energystoragepowerstationbattery),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStoragePowerStationBattery) {
			modifiedEnergyStoragePowerStationBattery.battery_state_point_id = modifiedEnergyStoragePowerStationBattery.battery_state_point.id;
			modifiedEnergyStoragePowerStationBattery.soc_point_id = modifiedEnergyStoragePowerStationBattery.soc_point.id;
			modifiedEnergyStoragePowerStationBattery.power_point_id = modifiedEnergyStoragePowerStationBattery.power_point.id;
			modifiedEnergyStoragePowerStationBattery.charge_meter_id = modifiedEnergyStoragePowerStationBattery.charge_meter.id;
			modifiedEnergyStoragePowerStationBattery.discharge_meter_id = modifiedEnergyStoragePowerStationBattery.discharge_meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStoragePowerStationBatteryService.editEnergyStoragePowerStationBattery($scope.currentEnergyStoragePowerStation.id, modifiedEnergyStoragePowerStationBattery, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStoragePowerStationBatteriesByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
            		$scope.$emit('handleEmitEnergyStoragePowerStationBatteryChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {
  			//do nothing;
  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.deleteEnergyStoragePowerStationBattery = function(energystoragepowerstationbattery) {
  		SweetAlert.swal({
  				title: $translate.instant("SWEET.TITLE"),
  				text: $translate.instant("SWEET.TEXT"),
  				type: "warning",
  				showCancelButton: true,
  				confirmButtonColor: "#DD6B55",
  				confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
  				cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
  				closeOnConfirm: true,
  				closeOnCancel: true
  			},
  			function(isConfirm) {
  				if (isConfirm) {
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  					EnergyStoragePowerStationBatteryService.deleteEnergyStoragePowerStationBattery($scope.currentEnergyStoragePowerStation.id, energystoragepowerstationbattery.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
								showCloseButton: true,
							});
							$scope.getEnergyStoragePowerStationBatteriesByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
							$scope.$emit('handleEmitEnergyStoragePowerStationBatteryChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

  	$scope.getAllEnergyStoragePowerStations();
	$scope.getAllPoints();
	$scope.getAllMeters();
    $scope.$on('handleBroadcastEnergyStoragePowerStationChanged', function(event) {
      $scope.getAllEnergyStoragePowerStations();
  	});

  });


  app.controller('ModalAddEnergyStoragePowerStationBatteryCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_BATTERY";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragepowerstationbattery);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStoragePowerStationBatteryCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_BATTERY";
  	$scope.energystoragepowerstationbattery = params.energystoragepowerstationbattery;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragepowerstationbattery);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
