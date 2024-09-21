'use strict';

app.controller('EnergyStorageContainerPowerconversionsystemController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerPowerconversionsystemService,
	PointService,
	MeterService,
	CommandService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerpowerconversionsystems = [];
	  $scope.meters = [];
	  $scope.points = [];
	  $scope.commands = [];
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

	$scope.getAllCommands = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CommandService.getAllCommands(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.commands = response.data;
			} else {
				$scope.commands = [];
			}
		});
	};
  	$scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerPowerconversionsystemService.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerpowerconversionsystems = response.data;
			} else {
          		$scope.energystoragecontainerpowerconversionsystems=[];
        	}
		});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_powerconversionsystem = true;
    	$scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerPowerconversionsystem = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerpowerconversionsystem.model.html',
  			controller: 'ModalAddEnergyStorageContainerPowerconversionsystemCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
						commands: angular.copy($scope.commands),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energystoragecontainerpowerconversionsystem) {
			energystoragecontainerpowerconversionsystem.run_state_point_id = energystoragecontainerpowerconversionsystem.run_state_point.id;
			if (energystoragecontainerpowerconversionsystem.today_charge_energy_point != null && energystoragecontainerpowerconversionsystem.today_charge_energy_point.id != null ) {
				energystoragecontainerpowerconversionsystem.today_charge_energy_point_id = energystoragecontainerpowerconversionsystem.today_charge_energy_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.today_charge_energy_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.today_discharge_energy_point != null && energystoragecontainerpowerconversionsystem.today_discharge_energy_point.id != null ) {
				energystoragecontainerpowerconversionsystem.today_discharge_energy_point_id = energystoragecontainerpowerconversionsystem.today_discharge_energy_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.today_discharge_energy_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.total_charge_energy_point != null && energystoragecontainerpowerconversionsystem.total_charge_energy_point.id != null ) {
				energystoragecontainerpowerconversionsystem.total_charge_energy_point_id = energystoragecontainerpowerconversionsystem.total_charge_energy_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.total_charge_energy_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.total_discharge_energy_point != null && energystoragecontainerpowerconversionsystem.total_discharge_energy_point.id != null ) {
				energystoragecontainerpowerconversionsystem.total_discharge_energy_point_id = energystoragecontainerpowerconversionsystem.total_discharge_energy_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.total_discharge_energy_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.total_ac_apparent_power_point != null && energystoragecontainerpowerconversionsystem.total_ac_apparent_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.total_ac_apparent_power_point_id = energystoragecontainerpowerconversionsystem.total_ac_apparent_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.total_ac_apparent_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.grid_connection_status_point != null && energystoragecontainerpowerconversionsystem.grid_connection_status_point.id != null ) {
				energystoragecontainerpowerconversionsystem.grid_connection_status_point_id = energystoragecontainerpowerconversionsystem.grid_connection_status_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.grid_connection_status_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.device_status_point != null && energystoragecontainerpowerconversionsystem.device_status_point.id != null ) {
				energystoragecontainerpowerconversionsystem.device_status_point_id = energystoragecontainerpowerconversionsystem.device_status_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.device_status_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.control_mode_point != null && energystoragecontainerpowerconversionsystem.control_mode_point.id != null ) {
				energystoragecontainerpowerconversionsystem.control_mode_point_id = energystoragecontainerpowerconversionsystem.control_mode_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.control_mode_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.total_ac_active_power_point != null && energystoragecontainerpowerconversionsystem.total_ac_active_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.total_ac_active_power_point_id = energystoragecontainerpowerconversionsystem.total_ac_active_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.total_ac_active_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.total_ac_reactive_power_point != null && energystoragecontainerpowerconversionsystem.total_ac_reactive_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.total_ac_reactive_power_point_id = energystoragecontainerpowerconversionsystem.total_ac_reactive_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.total_ac_reactive_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.total_ac_power_factor_point != null && energystoragecontainerpowerconversionsystem.total_ac_power_factor_point.id != null ) {
				energystoragecontainerpowerconversionsystem.total_ac_power_factor_point_id = energystoragecontainerpowerconversionsystem.total_ac_power_factor_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.total_ac_power_factor_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.ac_frequency_point != null && energystoragecontainerpowerconversionsystem.ac_frequency_point.id != null ) {
				energystoragecontainerpowerconversionsystem.ac_frequency_point_id = energystoragecontainerpowerconversionsystem.ac_frequency_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.ac_frequency_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_a_active_power_point != null && energystoragecontainerpowerconversionsystem.phase_a_active_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_a_active_power_point_id = energystoragecontainerpowerconversionsystem.phase_a_active_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_a_active_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_b_active_power_point != null && energystoragecontainerpowerconversionsystem.phase_b_active_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_b_active_power_point_id = energystoragecontainerpowerconversionsystem.phase_b_active_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_b_active_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_c_active_power_point != null && energystoragecontainerpowerconversionsystem.phase_c_active_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_c_active_power_point_id = energystoragecontainerpowerconversionsystem.phase_c_active_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_c_active_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_a_reactive_power_point != null && energystoragecontainerpowerconversionsystem.phase_a_reactive_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_a_reactive_power_point_id = energystoragecontainerpowerconversionsystem.phase_a_reactive_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_a_reactive_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_b_reactive_power_point != null && energystoragecontainerpowerconversionsystem.phase_b_reactive_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_b_reactive_power_point_id = energystoragecontainerpowerconversionsystem.phase_b_reactive_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_b_reactive_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_c_reactive_power_point != null && energystoragecontainerpowerconversionsystem.phase_c_reactive_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_c_reactive_power_point_id = energystoragecontainerpowerconversionsystem.phase_c_reactive_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_c_reactive_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_a_apparent_power_point != null && energystoragecontainerpowerconversionsystem.phase_a_apparent_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_a_apparent_power_point_id = energystoragecontainerpowerconversionsystem.phase_a_apparent_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_a_apparent_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_b_apparent_power_point != null && energystoragecontainerpowerconversionsystem.phase_b_apparent_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_b_apparent_power_point_id = energystoragecontainerpowerconversionsystem.phase_b_apparent_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_b_apparent_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_c_apparent_power_point != null && energystoragecontainerpowerconversionsystem.phase_c_apparent_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_c_apparent_power_point_id = energystoragecontainerpowerconversionsystem.phase_c_apparent_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_c_apparent_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.ab_voltage_point != null && energystoragecontainerpowerconversionsystem.ab_voltage_point.id != null ) {
				energystoragecontainerpowerconversionsystem.ab_voltage_point_id = energystoragecontainerpowerconversionsystem.ab_voltage_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.ab_voltage_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.bc_voltage_point != null && energystoragecontainerpowerconversionsystem.bc_voltage_point.id != null ) {
				energystoragecontainerpowerconversionsystem.bc_voltage_point_id = energystoragecontainerpowerconversionsystem.bc_voltage_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.bc_voltage_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.ca_voltage_point != null && energystoragecontainerpowerconversionsystem.ca_voltage_point.id != null ) {
				energystoragecontainerpowerconversionsystem.ca_voltage_point_id = energystoragecontainerpowerconversionsystem.ca_voltage_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.ca_voltage_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.ab_current_point != null && energystoragecontainerpowerconversionsystem.ab_current_point.id != null ) {
				energystoragecontainerpowerconversionsystem.ab_current_point_id = energystoragecontainerpowerconversionsystem.ab_current_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.ab_current_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.bc_current_point != null && energystoragecontainerpowerconversionsystem.bc_current_point.id != null ) {
				energystoragecontainerpowerconversionsystem.bc_current_point_id = energystoragecontainerpowerconversionsystem.bc_current_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.bc_current_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.ca_current_point != null && energystoragecontainerpowerconversionsystem.ca_current_point.id != null ) {
				energystoragecontainerpowerconversionsystem.ca_current_point_id = energystoragecontainerpowerconversionsystem.ca_current_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.ca_current_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_a_voltage_point != null && energystoragecontainerpowerconversionsystem.phase_a_voltage_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_a_voltage_point_id = energystoragecontainerpowerconversionsystem.phase_a_voltage_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_a_voltage_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_b_voltage_point != null && energystoragecontainerpowerconversionsystem.phase_b_voltage_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_b_voltage_point_id = energystoragecontainerpowerconversionsystem.phase_b_voltage_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_b_voltage_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_c_voltage_point != null && energystoragecontainerpowerconversionsystem.phase_c_voltage_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_c_voltage_point_id = energystoragecontainerpowerconversionsystem.phase_c_voltage_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_c_voltage_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_a_current_point != null && energystoragecontainerpowerconversionsystem.phase_a_current_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_a_current_point_id = energystoragecontainerpowerconversionsystem.phase_a_current_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_a_current_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_b_current_point != null && energystoragecontainerpowerconversionsystem.phase_b_current_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_b_current_point_id = energystoragecontainerpowerconversionsystem.phase_b_current_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_b_current_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.phase_c_current_point != null && energystoragecontainerpowerconversionsystem.phase_c_current_point.id != null ) {
				energystoragecontainerpowerconversionsystem.phase_c_current_point_id = energystoragecontainerpowerconversionsystem.phase_c_current_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.phase_c_current_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.pcs_module_temperature_point != null && energystoragecontainerpowerconversionsystem.pcs_module_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.pcs_module_temperature_point_id = energystoragecontainerpowerconversionsystem.pcs_module_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.pcs_module_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.pcs_ambient_temperature_point != null && energystoragecontainerpowerconversionsystem.pcs_ambient_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.pcs_ambient_temperature_point_id = energystoragecontainerpowerconversionsystem.pcs_ambient_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.pcs_ambient_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.a1_module_temperature_point != null && energystoragecontainerpowerconversionsystem.a1_module_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.a1_module_temperature_point_id = energystoragecontainerpowerconversionsystem.a1_module_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.a1_module_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.b1_module_temperature_point != null && energystoragecontainerpowerconversionsystem.b1_module_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.b1_module_temperature_point_id = energystoragecontainerpowerconversionsystem.b1_module_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.b1_module_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.c1_module_temperature_point != null && energystoragecontainerpowerconversionsystem.c1_module_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.c1_module_temperature_point_id = energystoragecontainerpowerconversionsystem.c1_module_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.c1_module_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.a2_module_temperature_point != null && energystoragecontainerpowerconversionsystem.a2_module_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.a2_module_temperature_point_id = energystoragecontainerpowerconversionsystem.a2_module_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.a2_module_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.b2_module_temperature_point != null && energystoragecontainerpowerconversionsystem.b2_module_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.b2_module_temperature_point_id = energystoragecontainerpowerconversionsystem.b2_module_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.b2_module_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.c2_module_temperature_point != null && energystoragecontainerpowerconversionsystem.c2_module_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.c2_module_temperature_point_id = energystoragecontainerpowerconversionsystem.c2_module_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.c2_module_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.air_inlet_temperature_point != null && energystoragecontainerpowerconversionsystem.air_inlet_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.air_inlet_temperature_point_id = energystoragecontainerpowerconversionsystem.air_inlet_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.air_inlet_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.air_outlet_temperature_point != null && energystoragecontainerpowerconversionsystem.air_outlet_temperature_point.id != null ) {
				energystoragecontainerpowerconversionsystem.air_outlet_temperature_point_id = energystoragecontainerpowerconversionsystem.air_outlet_temperature_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.air_outlet_temperature_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.dc_power_point != null && energystoragecontainerpowerconversionsystem.dc_power_point.id != null ) {
				energystoragecontainerpowerconversionsystem.dc_power_point_id = energystoragecontainerpowerconversionsystem.dc_power_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.dc_power_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.dc_voltage_point != null && energystoragecontainerpowerconversionsystem.dc_voltage_point.id != null ) {
				energystoragecontainerpowerconversionsystem.dc_voltage_point_id = energystoragecontainerpowerconversionsystem.dc_voltage_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.dc_voltage_point_id = undefined;
			}
			if (energystoragecontainerpowerconversionsystem.dc_current_point != null && energystoragecontainerpowerconversionsystem.dc_current_point.id != null ) {
				energystoragecontainerpowerconversionsystem.dc_current_point_id = energystoragecontainerpowerconversionsystem.dc_current_point.id;
			} else {
				energystoragecontainerpowerconversionsystem.dc_current_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerPowerconversionsystemService.addEnergyStorageContainerPowerconversionsystem($scope.currentEnergyStorageContainer.id, energystoragecontainerpowerconversionsystem, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerPowerconversionsystemChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerPowerconversionsystem = function(energystoragecontainerpowerconversionsystem) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerpowerconversionsystem.model.html',
  			controller: 'ModalEditEnergyStorageContainerPowerconversionsystemCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerpowerconversionsystem: angular.copy(energystoragecontainerpowerconversionsystem),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
						commands: angular.copy($scope.commands),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerPowerconversionsystem) {
			modifiedEnergyStorageContainerPowerconversionsystem.run_state_point_id = modifiedEnergyStorageContainerPowerconversionsystem.run_state_point.id;

			if (modifiedEnergyStorageContainerPowerconversionsystem.today_charge_energy_point != null && modifiedEnergyStorageContainerPowerconversionsystem.today_charge_energy_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.today_charge_energy_point_id = modifiedEnergyStorageContainerPowerconversionsystem.today_charge_energy_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.today_charge_energy_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.today_discharge_energy_point != null && modifiedEnergyStorageContainerPowerconversionsystem.today_discharge_energy_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.today_discharge_energy_point_id = modifiedEnergyStorageContainerPowerconversionsystem.today_discharge_energy_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.today_discharge_energy_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.total_charge_energy_point != null && modifiedEnergyStorageContainerPowerconversionsystem.total_charge_energy_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.total_charge_energy_point_id = modifiedEnergyStorageContainerPowerconversionsystem.total_charge_energy_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.total_charge_energy_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.total_discharge_energy_point != null && modifiedEnergyStorageContainerPowerconversionsystem.total_discharge_energy_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.total_discharge_energy_point_id = modifiedEnergyStorageContainerPowerconversionsystem.total_discharge_energy_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.total_discharge_energy_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.total_ac_apparent_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.total_ac_apparent_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.total_ac_apparent_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.total_ac_apparent_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.total_ac_apparent_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.grid_connection_status_point != null && modifiedEnergyStorageContainerPowerconversionsystem.grid_connection_status_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.grid_connection_status_point_id = modifiedEnergyStorageContainerPowerconversionsystem.grid_connection_status_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.grid_connection_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.device_status_point != null && modifiedEnergyStorageContainerPowerconversionsystem.device_status_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.device_status_point_id = modifiedEnergyStorageContainerPowerconversionsystem.device_status_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.device_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.control_mode_point != null && modifiedEnergyStorageContainerPowerconversionsystem.control_mode_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.control_mode_point_id = modifiedEnergyStorageContainerPowerconversionsystem.control_mode_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.control_mode_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.total_ac_active_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.total_ac_active_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.total_ac_active_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.total_ac_active_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.total_ac_active_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.total_ac_reactive_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.total_ac_reactive_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.total_ac_reactive_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.total_ac_reactive_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.total_ac_reactive_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.total_ac_power_factor_point != null && modifiedEnergyStorageContainerPowerconversionsystem.total_ac_power_factor_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.total_ac_power_factor_point_id = modifiedEnergyStorageContainerPowerconversionsystem.total_ac_power_factor_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.total_ac_power_factor_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.ac_frequency_point != null && modifiedEnergyStorageContainerPowerconversionsystem.ac_frequency_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.ac_frequency_point_id = modifiedEnergyStorageContainerPowerconversionsystem.ac_frequency_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.ac_frequency_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_a_active_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_a_active_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_active_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_a_active_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_active_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_b_active_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_b_active_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_active_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_b_active_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_active_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_c_active_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_c_active_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_active_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_c_active_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_active_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_a_reactive_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_a_reactive_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_reactive_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_a_reactive_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_reactive_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_b_reactive_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_b_reactive_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_reactive_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_b_reactive_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_reactive_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_c_reactive_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_c_reactive_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_reactive_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_c_reactive_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_reactive_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_a_apparent_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_a_apparent_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_apparent_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_a_apparent_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_apparent_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_b_apparent_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_b_apparent_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_apparent_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_b_apparent_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_apparent_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_c_apparent_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_c_apparent_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_apparent_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_c_apparent_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_apparent_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.ab_voltage_point != null && modifiedEnergyStorageContainerPowerconversionsystem.ab_voltage_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.ab_voltage_point_id = modifiedEnergyStorageContainerPowerconversionsystem.ab_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.ab_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.bc_voltage_point != null && modifiedEnergyStorageContainerPowerconversionsystem.bc_voltage_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.bc_voltage_point_id = modifiedEnergyStorageContainerPowerconversionsystem.bc_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.bc_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.ca_voltage_point != null && modifiedEnergyStorageContainerPowerconversionsystem.ca_voltage_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.ca_voltage_point_id = modifiedEnergyStorageContainerPowerconversionsystem.ca_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.ca_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.ab_current_point != null && modifiedEnergyStorageContainerPowerconversionsystem.ab_current_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.ab_current_point_id = modifiedEnergyStorageContainerPowerconversionsystem.ab_current_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.ab_current_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.bc_current_point != null && modifiedEnergyStorageContainerPowerconversionsystem.bc_current_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.bc_current_point_id = modifiedEnergyStorageContainerPowerconversionsystem.bc_current_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.bc_current_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.ca_current_point != null && modifiedEnergyStorageContainerPowerconversionsystem.ca_current_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.ca_current_point_id = modifiedEnergyStorageContainerPowerconversionsystem.ca_current_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.ca_current_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_a_voltage_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_a_voltage_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_voltage_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_a_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_b_voltage_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_b_voltage_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_voltage_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_b_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_c_voltage_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_c_voltage_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_voltage_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_c_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_a_current_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_a_current_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_current_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_a_current_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_a_current_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_b_current_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_b_current_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_current_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_b_current_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_b_current_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.phase_c_current_point != null && modifiedEnergyStorageContainerPowerconversionsystem.phase_c_current_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_current_point_id = modifiedEnergyStorageContainerPowerconversionsystem.phase_c_current_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.phase_c_current_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.pcs_module_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.pcs_module_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.pcs_module_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.pcs_module_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.pcs_module_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.pcs_ambient_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.pcs_ambient_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.pcs_ambient_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.pcs_ambient_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.pcs_ambient_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.a1_module_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.a1_module_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.a1_module_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.a1_module_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.a1_module_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.b1_module_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.b1_module_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.b1_module_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.b1_module_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.b1_module_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.c1_module_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.c1_module_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.c1_module_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.c1_module_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.c1_module_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.a2_module_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.a2_module_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.a2_module_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.a2_module_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.a2_module_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.b2_module_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.b2_module_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.b2_module_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.b2_module_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.b2_module_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.c2_module_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.c2_module_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.c2_module_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.c2_module_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.c2_module_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.air_inlet_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.air_inlet_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.air_inlet_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.air_inlet_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.air_inlet_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.air_outlet_temperature_point != null && modifiedEnergyStorageContainerPowerconversionsystem.air_outlet_temperature_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.air_outlet_temperature_point_id = modifiedEnergyStorageContainerPowerconversionsystem.air_outlet_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.air_outlet_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.dc_power_point != null && modifiedEnergyStorageContainerPowerconversionsystem.dc_power_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.dc_power_point_id = modifiedEnergyStorageContainerPowerconversionsystem.dc_power_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.dc_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.dc_voltage_point != null && modifiedEnergyStorageContainerPowerconversionsystem.dc_voltage_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.dc_voltage_point_id = modifiedEnergyStorageContainerPowerconversionsystem.dc_voltage_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.dc_voltage_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerPowerconversionsystem.dc_current_point != null && modifiedEnergyStorageContainerPowerconversionsystem.dc_current_point.id != null ) {
				modifiedEnergyStorageContainerPowerconversionsystem.dc_current_point_id = modifiedEnergyStorageContainerPowerconversionsystem.dc_current_point.id;
			} else {
				modifiedEnergyStorageContainerPowerconversionsystem.dc_current_point_id = undefined;
			}
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerPowerconversionsystemService.editEnergyStorageContainerPowerconversionsystem($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerPowerconversionsystem, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerPowerconversionsystemChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM")}),
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

  	$scope.deleteEnergyStorageContainerPowerconversionsystem = function(energystoragecontainerpowerconversionsystem) {
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
  					EnergyStorageContainerPowerconversionsystemService.deleteEnergyStorageContainerPowerconversionsystem($scope.currentEnergyStorageContainer.id, energystoragecontainerpowerconversionsystem.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerPowerconversionsystemChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM")}),
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
	$scope.getAllCommands();
    $scope.$on('handleBroadcastEnergyStorageContainerChanged', function(event) {
      $scope.getAllEnergyStorageContainers();
  	});

  });


  app.controller('ModalAddEnergyStorageContainerPowerconversionsystemCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM";
	$scope.points=params.points;
	$scope.meters=params.meters;
	$scope.commands=params.commands;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerpowerconversionsystem);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerPowerconversionsystemCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM";
  	$scope.energystoragecontainerpowerconversionsystem = params.energystoragecontainerpowerconversionsystem;
	$scope.points=params.points;
	$scope.meters=params.meters;
	$scope.commands=params.commands;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerpowerconversionsystem);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
