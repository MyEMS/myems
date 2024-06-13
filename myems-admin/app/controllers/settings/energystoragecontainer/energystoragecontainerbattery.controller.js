'use strict';

app.controller('EnergyStorageContainerBatteryController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerBatteryService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerbatteries = [];
	  $scope.points = [];
	  $scope.meters = [];
      $scope.currentEnergyStorageContainer = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.getAllEnergyStorageContainers = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerService.getAllEnergyStorageContainers(headers, function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.energystoragecontainers = response.data;
  			} else {
  				$scope.energystoragecontainers = [];
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

  	$scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerBatteryService.getEnergyStorageContainerBatteriesByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerbatteries = response.data;
			} else {
          	$scope.energystoragecontainerbatteries=[];
        }
			});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_battery = true;
    	$scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerBattery = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerbattery.model.html',
  			controller: 'ModalAddEnergyStorageContainerBatteryCtrl',
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
  		modalInstance.result.then(function(energystoragecontainerbattery) {
        	energystoragecontainerbattery.battery_state_point_id = energystoragecontainerbattery.battery_state_point.id;
			energystoragecontainerbattery.soc_point_id = energystoragecontainerbattery.soc_point.id;
			energystoragecontainerbattery.power_point_id = energystoragecontainerbattery.power_point.id;
			energystoragecontainerbattery.charge_meter_id = energystoragecontainerbattery.charge_meter.id;
			energystoragecontainerbattery.discharge_meter_id = energystoragecontainerbattery.discharge_meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerBatteryService.addEnergyStorageContainerBattery($scope.currentEnergyStorageContainer.id, energystoragecontainerbattery, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerBatteryChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerBattery = function(energystoragecontainerbattery) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerbattery.model.html',
  			controller: 'ModalEditEnergyStorageContainerBatteryCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerbattery: angular.copy(energystoragecontainerbattery),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerBattery) {
			modifiedEnergyStorageContainerBattery.battery_state_point_id = modifiedEnergyStorageContainerBattery.battery_state_point.id;
			modifiedEnergyStorageContainerBattery.soc_point_id = modifiedEnergyStorageContainerBattery.soc_point.id;
			modifiedEnergyStorageContainerBattery.power_point_id = modifiedEnergyStorageContainerBattery.power_point.id;
			modifiedEnergyStorageContainerBattery.charge_meter_id = modifiedEnergyStorageContainerBattery.charge_meter.id;
			modifiedEnergyStorageContainerBattery.discharge_meter_id = modifiedEnergyStorageContainerBattery.discharge_meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerBatteryService.editEnergyStorageContainerBattery($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerBattery, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerBatteryChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY")}),
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

  	$scope.deleteEnergyStorageContainerBattery = function(energystoragecontainerbattery) {
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
  					EnergyStorageContainerBatteryService.deleteEnergyStorageContainerBattery($scope.currentEnergyStorageContainer.id, energystoragecontainerbattery.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerBatteryChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

  	$scope.getAllEnergyStorageContainers();
	$scope.getAllPoints();
	$scope.getAllMeters();
    $scope.$on('handleBroadcastEnergyStorageContainerChanged', function(event) {
      $scope.getAllEnergyStorageContainers();
  	});

  });


  app.controller('ModalAddEnergyStorageContainerBatteryCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_BATTERY";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerbattery);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerBatteryCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_BATTERY";
  	$scope.energystoragecontainerbattery = params.energystoragecontainerbattery;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerbattery);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
