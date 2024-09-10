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

			if (energystoragecontainerbattery.communication_status_with_pcs_point != null && energystoragecontainerbattery.communication_status_with_pcs_point.id != null ) {
				energystoragecontainerbattery.communication_status_with_pcs_point_id = energystoragecontainerbattery.communication_status_with_pcs_point.id;
			} else {
				energystoragecontainerbattery.communication_status_with_pcs_point_id = undefined;
			}
			if (energystoragecontainerbattery.communication_status_with_ems_point != null && energystoragecontainerbattery.communication_status_with_ems_point.id != null ) {
				energystoragecontainerbattery.communication_status_with_ems_point_id = energystoragecontainerbattery.communication_status_with_ems_point.id;
			} else {
				energystoragecontainerbattery.communication_status_with_ems_point_id = undefined;
			}
			if (energystoragecontainerbattery.grid_status_point != null && energystoragecontainerbattery.grid_status_point.id != null ) {
				energystoragecontainerbattery.grid_status_point_id = energystoragecontainerbattery.grid_status_point.id;
			} else {
				energystoragecontainerbattery.grid_status_point_id = undefined;
			}
			if (energystoragecontainerbattery.total_voltage_point != null && energystoragecontainerbattery.total_voltage_point.id != null ) {
				energystoragecontainerbattery.total_voltage_point_id = energystoragecontainerbattery.total_voltage_point.id;
			} else {
				energystoragecontainerbattery.total_voltage_point_id = undefined;
			}
			if (energystoragecontainerbattery.total_current_point != null && energystoragecontainerbattery.total_current_point.id != null ) {
				energystoragecontainerbattery.total_current_point_id = energystoragecontainerbattery.total_current_point.id;
			} else {
				energystoragecontainerbattery.total_current_point_id = undefined;
			}
			if (energystoragecontainerbattery.soh_point != null && energystoragecontainerbattery.soh_point.id != null ) {
				energystoragecontainerbattery.soh_point_id = energystoragecontainerbattery.soh_point.id;
			} else {
				energystoragecontainerbattery.soh_point_id = undefined;
			}
			if (energystoragecontainerbattery.charging_power_limit_point != null && energystoragecontainerbattery.charging_power_limit_point.id != null ) {
				energystoragecontainerbattery.charging_power_limit_point_id = energystoragecontainerbattery.charging_power_limit_point.id;
			} else {
				energystoragecontainerbattery.charging_power_limit_point_id = undefined;
			}
			if (energystoragecontainerbattery.discharge_limit_power_point != null && energystoragecontainerbattery.discharge_limit_power_point.id != null ) {
				energystoragecontainerbattery.discharge_limit_power_point_id = energystoragecontainerbattery.discharge_limit_power_point.id;
			} else {
				energystoragecontainerbattery.discharge_limit_power_point_id = undefined;
			}
			if (energystoragecontainerbattery.rechargeable_capacity_point != null && energystoragecontainerbattery.rechargeable_capacity_point.id != null ) {
				energystoragecontainerbattery.rechargeable_capacity_point_id = energystoragecontainerbattery.rechargeable_capacity_point.id;
			} else {
				energystoragecontainerbattery.rechargeable_capacity_point_id = undefined;
			}
			if (energystoragecontainerbattery.dischargeable_capacity_point != null && energystoragecontainerbattery.dischargeable_capacity_point.id != null ) {
				energystoragecontainerbattery.dischargeable_capacity_point_id = energystoragecontainerbattery.dischargeable_capacity_point.id;
			} else {
				energystoragecontainerbattery.dischargeable_capacity_point_id = undefined;
			}
			if (energystoragecontainerbattery.average_temperature_point != null && energystoragecontainerbattery.average_temperature_point.id != null ) {
				energystoragecontainerbattery.average_temperature_point_id = energystoragecontainerbattery.average_temperature_point.id;
			} else {
				energystoragecontainerbattery.average_temperature_point_id = undefined;
			}
			if (energystoragecontainerbattery.average_voltage_point != null && energystoragecontainerbattery.average_voltage_point.id != null ) {
				energystoragecontainerbattery.average_voltage_point_id = energystoragecontainerbattery.average_voltage_point.id;
			} else {
				energystoragecontainerbattery.average_voltage_point_id = undefined;
			}
			if (energystoragecontainerbattery.insulation_value_point != null && energystoragecontainerbattery.insulation_value_point.id != null ) {
				energystoragecontainerbattery.insulation_value_point_id = energystoragecontainerbattery.insulation_value_point.id;
			} else {
				energystoragecontainerbattery.insulation_value_point_id = undefined;
			}
			if (energystoragecontainerbattery.positive_insulation_value_point != null && energystoragecontainerbattery.positive_insulation_value_point.id != null ) {
				energystoragecontainerbattery.positive_insulation_value_point_id = energystoragecontainerbattery.positive_insulation_value_point.id;
			} else {
				energystoragecontainerbattery.positive_insulation_value_point_id = undefined;
			}
			if (energystoragecontainerbattery.negative_insulation_value_point != null && energystoragecontainerbattery.negative_insulation_value_point.id != null ) {
				energystoragecontainerbattery.negative_insulation_value_point_id = energystoragecontainerbattery.negative_insulation_value_point.id;
			} else {
				energystoragecontainerbattery.negative_insulation_value_point_id = undefined;
			}
			if (energystoragecontainerbattery.maximum_temperature_point != null && energystoragecontainerbattery.maximum_temperature_point.id != null ) {
				energystoragecontainerbattery.maximum_temperature_point_id = energystoragecontainerbattery.maximum_temperature_point.id;
			} else {
				energystoragecontainerbattery.maximum_temperature_point_id = undefined;
			}
			if (energystoragecontainerbattery.maximum_temperature_battery_cell_point != null && energystoragecontainerbattery.maximum_temperature_battery_cell_point.id != null ) {
				energystoragecontainerbattery.maximum_temperature_battery_cell_point_id = energystoragecontainerbattery.maximum_temperature_battery_cell_point.id;
			} else {
				energystoragecontainerbattery.maximum_temperature_battery_cell_point_id = undefined;
			}
			if (energystoragecontainerbattery.minimum_temperature_point != null && energystoragecontainerbattery.minimum_temperature_point.id != null ) {
				energystoragecontainerbattery.minimum_temperature_point_id = energystoragecontainerbattery.minimum_temperature_point.id;
			} else {
				energystoragecontainerbattery.minimum_temperature_point_id = undefined;
			}
			if (energystoragecontainerbattery.minimum_temperature_battery_cell_point != null && energystoragecontainerbattery.minimum_temperature_battery_cell_point.id != null ) {
				energystoragecontainerbattery.minimum_temperature_battery_cell_point_id = energystoragecontainerbattery.minimum_temperature_battery_cell_point.id;
			} else {
				energystoragecontainerbattery.minimum_temperature_battery_cell_point_id = undefined;
			}
			if (energystoragecontainerbattery.maximum_voltage_point != null && energystoragecontainerbattery.maximum_voltage_point.id != null ) {
				energystoragecontainerbattery.maximum_voltage_point_id = energystoragecontainerbattery.maximum_voltage_point.id;
			} else {
				energystoragecontainerbattery.maximum_voltage_point_id = undefined;
			}
			if (energystoragecontainerbattery.maximum_voltage_battery_cell_point != null && energystoragecontainerbattery.maximum_voltage_battery_cell_point.id != null ) {
				energystoragecontainerbattery.maximum_voltage_battery_cell_point_id = energystoragecontainerbattery.maximum_voltage_battery_cell_point.id;
			} else {
				energystoragecontainerbattery.maximum_voltage_battery_cell_point_id = undefined;
			}
			if (energystoragecontainerbattery.minimum_voltage_point != null && energystoragecontainerbattery.minimum_voltage_point.id != null ) {
				energystoragecontainerbattery.minimum_voltage_point_id = energystoragecontainerbattery.minimum_voltage_point.id;
			} else {
				energystoragecontainerbattery.minimum_voltage_point_id = undefined;
			}
			if (energystoragecontainerbattery.minimum_voltage_battery_cell_point != null && energystoragecontainerbattery.minimum_voltage_battery_cell_point.id != null ) {
				energystoragecontainerbattery.minimum_voltage_battery_cell_point_id = energystoragecontainerbattery.minimum_voltage_battery_cell_point.id;
			} else {
				energystoragecontainerbattery.minimum_voltage_battery_cell_point_id = undefined;
			}
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

			if (modifiedEnergyStorageContainerBattery.communication_status_with_pcs_point != null && modifiedEnergyStorageContainerBattery.communication_status_with_pcs_point.id != null ) {
				modifiedEnergyStorageContainerBattery.communication_status_with_pcs_point_id = modifiedEnergyStorageContainerBattery.communication_status_with_pcs_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.communication_status_with_pcs_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.communication_status_with_ems_point != null && modifiedEnergyStorageContainerBattery.communication_status_with_ems_point.id != null ) {
				modifiedEnergyStorageContainerBattery.communication_status_with_ems_point_id = modifiedEnergyStorageContainerBattery.communication_status_with_ems_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.communication_status_with_ems_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.grid_status_point != null && modifiedEnergyStorageContainerBattery.grid_status_point.id != null ) {
				modifiedEnergyStorageContainerBattery.grid_status_point_id = modifiedEnergyStorageContainerBattery.grid_status_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.grid_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.total_voltage_point != null && modifiedEnergyStorageContainerBattery.total_voltage_point.id != null ) {
				modifiedEnergyStorageContainerBattery.total_voltage_point_id = modifiedEnergyStorageContainerBattery.total_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.total_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.total_current_point != null && modifiedEnergyStorageContainerBattery.total_current_point.id != null ) {
				modifiedEnergyStorageContainerBattery.total_current_point_id = modifiedEnergyStorageContainerBattery.total_current_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.total_current_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.soh_point != null && modifiedEnergyStorageContainerBattery.soh_point.id != null ) {
				modifiedEnergyStorageContainerBattery.soh_point_id = modifiedEnergyStorageContainerBattery.soh_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.soh_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.charging_power_limit_point != null && modifiedEnergyStorageContainerBattery.charging_power_limit_point.id != null ) {
				modifiedEnergyStorageContainerBattery.charging_power_limit_point_id = modifiedEnergyStorageContainerBattery.charging_power_limit_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.charging_power_limit_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.discharge_limit_power_point != null && modifiedEnergyStorageContainerBattery.discharge_limit_power_point.id != null ) {
				modifiedEnergyStorageContainerBattery.discharge_limit_power_point_id = modifiedEnergyStorageContainerBattery.discharge_limit_power_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.discharge_limit_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.rechargeable_capacity_point != null && modifiedEnergyStorageContainerBattery.rechargeable_capacity_point.id != null ) {
				modifiedEnergyStorageContainerBattery.rechargeable_capacity_point_id = modifiedEnergyStorageContainerBattery.rechargeable_capacity_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.rechargeable_capacity_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.dischargeable_capacity_point != null && modifiedEnergyStorageContainerBattery.dischargeable_capacity_point.id != null ) {
				modifiedEnergyStorageContainerBattery.dischargeable_capacity_point_id = modifiedEnergyStorageContainerBattery.dischargeable_capacity_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.dischargeable_capacity_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.average_temperature_point != null && modifiedEnergyStorageContainerBattery.average_temperature_point.id != null ) {
				modifiedEnergyStorageContainerBattery.average_temperature_point_id = modifiedEnergyStorageContainerBattery.average_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.average_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.average_voltage_point != null && modifiedEnergyStorageContainerBattery.average_voltage_point.id != null ) {
				modifiedEnergyStorageContainerBattery.average_voltage_point_id = modifiedEnergyStorageContainerBattery.average_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.average_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.insulation_value_point != null && modifiedEnergyStorageContainerBattery.insulation_value_point.id != null ) {
				modifiedEnergyStorageContainerBattery.insulation_value_point_id = modifiedEnergyStorageContainerBattery.insulation_value_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.insulation_value_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.positive_insulation_value_point != null && modifiedEnergyStorageContainerBattery.positive_insulation_value_point.id != null ) {
				modifiedEnergyStorageContainerBattery.positive_insulation_value_point_id = modifiedEnergyStorageContainerBattery.positive_insulation_value_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.positive_insulation_value_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.negative_insulation_value_point != null && modifiedEnergyStorageContainerBattery.negative_insulation_value_point.id != null ) {
				modifiedEnergyStorageContainerBattery.negative_insulation_value_point_id = modifiedEnergyStorageContainerBattery.negative_insulation_value_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.negative_insulation_value_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.maximum_temperature_point != null && modifiedEnergyStorageContainerBattery.maximum_temperature_point.id != null ) {
				modifiedEnergyStorageContainerBattery.maximum_temperature_point_id = modifiedEnergyStorageContainerBattery.maximum_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.maximum_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.maximum_temperature_battery_cell_point != null && modifiedEnergyStorageContainerBattery.maximum_temperature_battery_cell_point.id != null ) {
				modifiedEnergyStorageContainerBattery.maximum_temperature_battery_cell_point_id = modifiedEnergyStorageContainerBattery.maximum_temperature_battery_cell_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.maximum_temperature_battery_cell_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.minimum_temperature_point != null && modifiedEnergyStorageContainerBattery.minimum_temperature_point.id != null ) {
				modifiedEnergyStorageContainerBattery.minimum_temperature_point_id = modifiedEnergyStorageContainerBattery.minimum_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.minimum_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.minimum_temperature_battery_cell_point != null && modifiedEnergyStorageContainerBattery.minimum_temperature_battery_cell_point.id != null ) {
				modifiedEnergyStorageContainerBattery.minimum_temperature_battery_cell_point_id = modifiedEnergyStorageContainerBattery.minimum_temperature_battery_cell_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.minimum_temperature_battery_cell_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.maximum_voltage_point != null && modifiedEnergyStorageContainerBattery.maximum_voltage_point.id != null ) {
				modifiedEnergyStorageContainerBattery.maximum_voltage_point_id = modifiedEnergyStorageContainerBattery.maximum_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.maximum_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.maximum_voltage_battery_cell_point != null && modifiedEnergyStorageContainerBattery.maximum_voltage_battery_cell_point.id != null ) {
				modifiedEnergyStorageContainerBattery.maximum_voltage_battery_cell_point_id = modifiedEnergyStorageContainerBattery.maximum_voltage_battery_cell_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.maximum_voltage_battery_cell_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.minimum_voltage_point != null && modifiedEnergyStorageContainerBattery.minimum_voltage_point.id != null ) {
				modifiedEnergyStorageContainerBattery.minimum_voltage_point_id = modifiedEnergyStorageContainerBattery.minimum_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.minimum_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerBattery.minimum_voltage_battery_cell_point != null && modifiedEnergyStorageContainerBattery.minimum_voltage_battery_cell_point.id != null ) {
				modifiedEnergyStorageContainerBattery.minimum_voltage_battery_cell_point_id = modifiedEnergyStorageContainerBattery.minimum_voltage_battery_cell_point.id;
			} else {
				modifiedEnergyStorageContainerBattery.minimum_voltage_battery_cell_point_id = undefined;
			}

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
