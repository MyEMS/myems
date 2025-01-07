'use strict';

app.controller('EnergyStorageContainerHVACController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerHVACService,
	PointService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerhvacs = [];
	  $scope.points = [];
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

  	$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerHVACService.getEnergyStorageContainerHVACsByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerhvacs = response.data;
			} else {
          	    $scope.energystoragecontainerhvacs=[];
            }
		});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_hvac = true;
    	$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerHVAC = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerhvac.model.html',
  			controller: 'ModalAddEnergyStorageContainerHVACCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energystoragecontainerhvac) {
			if (energystoragecontainerhvac.working_status_point != null && energystoragecontainerhvac.working_status_point.id != null ) {
				energystoragecontainerhvac.working_status_point_id = energystoragecontainerhvac.working_status_point.id;
			} else {
				energystoragecontainerhvac.working_status_point_id = undefined;
			}
			if (energystoragecontainerhvac.indoor_fan_status_point != null && energystoragecontainerhvac.indoor_fan_status_point.id != null ) {
				energystoragecontainerhvac.indoor_fan_status_point_id = energystoragecontainerhvac.indoor_fan_status_point.id;
			} else {
				energystoragecontainerhvac.indoor_fan_status_point_id = undefined;
			}
			if (energystoragecontainerhvac.outdoor_fan_status_point != null && energystoragecontainerhvac.outdoor_fan_status_point.id != null ) {
				energystoragecontainerhvac.outdoor_fan_status_point_id = energystoragecontainerhvac.outdoor_fan_status_point.id;
			} else {
				energystoragecontainerhvac.outdoor_fan_status_point_id = undefined;
			}
			if (energystoragecontainerhvac.emergency_fan_status_point != null && energystoragecontainerhvac.emergency_fan_status_point.id != null ) {
				energystoragecontainerhvac.emergency_fan_status_point_id = energystoragecontainerhvac.emergency_fan_status_point.id;
			} else {
				energystoragecontainerhvac.emergency_fan_status_point_id = undefined;
			}
			if (energystoragecontainerhvac.compressor_status_point != null && energystoragecontainerhvac.compressor_status_point.id != null ) {
				energystoragecontainerhvac.compressor_status_point_id = energystoragecontainerhvac.compressor_status_point.id;
			} else {
				energystoragecontainerhvac.compressor_status_point_id = undefined;
			}
			if (energystoragecontainerhvac.electric_heating_status_point != null && energystoragecontainerhvac.electric_heating_status_point.id != null ) {
				energystoragecontainerhvac.electric_heating_status_point_id = energystoragecontainerhvac.electric_heating_status_point.id;
			} else {
				energystoragecontainerhvac.electric_heating_status_point_id = undefined;
			}
			if (energystoragecontainerhvac.coil_temperature_point != null && energystoragecontainerhvac.coil_temperature_point.id != null ) {
				energystoragecontainerhvac.coil_temperature_point_id = energystoragecontainerhvac.coil_temperature_point.id;
			} else {
				energystoragecontainerhvac.coil_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.temperature_outside_point != null && energystoragecontainerhvac.temperature_outside_point.id != null ) {
				energystoragecontainerhvac.temperature_outside_point_id = energystoragecontainerhvac.temperature_outside_point.id;
			} else {
				energystoragecontainerhvac.temperature_outside_point_id = undefined;
			}
			if (energystoragecontainerhvac.temperature_inside_point != null && energystoragecontainerhvac.temperature_inside_point.id != null ) {
				energystoragecontainerhvac.temperature_inside_point_id = energystoragecontainerhvac.temperature_inside_point.id;
			} else {
				energystoragecontainerhvac.temperature_inside_point_id = undefined;
			}
			if (energystoragecontainerhvac.humidity_inside_point != null && energystoragecontainerhvac.humidity_inside_point.id != null ) {
				energystoragecontainerhvac.humidity_inside_point_id = energystoragecontainerhvac.humidity_inside_point.id;
			} else {
				energystoragecontainerhvac.humidity_inside_point_id = undefined;
			}
			if (energystoragecontainerhvac.condensation_temperature_point != null && energystoragecontainerhvac.condensation_temperature_point.id != null ) {
				energystoragecontainerhvac.condensation_temperature_point_id = energystoragecontainerhvac.condensation_temperature_point.id;
			} else {
				energystoragecontainerhvac.condensation_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.defrosting_temperature_point != null && energystoragecontainerhvac.defrosting_temperature_point.id != null ) {
				energystoragecontainerhvac.defrosting_temperature_point_id = energystoragecontainerhvac.defrosting_temperature_point.id;
			} else {
				energystoragecontainerhvac.defrosting_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.outlet_air_temperature_point != null && energystoragecontainerhvac.outlet_air_temperature_point.id != null ) {
				energystoragecontainerhvac.outlet_air_temperature_point_id = energystoragecontainerhvac.outlet_air_temperature_point.id;
			} else {
				energystoragecontainerhvac.outlet_air_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.return_air_temperature_point != null && energystoragecontainerhvac.return_air_temperature_point.id != null ) {
				energystoragecontainerhvac.return_air_temperature_point_id = energystoragecontainerhvac.return_air_temperature_point.id;
			} else {
				energystoragecontainerhvac.return_air_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.exhaust_temperature_point != null && energystoragecontainerhvac.exhaust_temperature_point.id != null ) {
				energystoragecontainerhvac.exhaust_temperature_point_id = energystoragecontainerhvac.exhaust_temperature_point.id;
			} else {
				energystoragecontainerhvac.exhaust_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.heating_on_temperature_point != null && energystoragecontainerhvac.heating_on_temperature_point.id != null ) {
				energystoragecontainerhvac.heating_on_temperature_point_id = energystoragecontainerhvac.heating_on_temperature_point.id;
			} else {
				energystoragecontainerhvac.heating_on_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.heating_off_temperature_point != null && energystoragecontainerhvac.heating_off_temperature_point.id != null ) {
				energystoragecontainerhvac.heating_off_temperature_point_id = energystoragecontainerhvac.heating_off_temperature_point.id;
			} else {
				energystoragecontainerhvac.heating_off_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.heating_control_hysteresis_point != null && energystoragecontainerhvac.heating_control_hysteresis_point.id != null ) {
				energystoragecontainerhvac.heating_control_hysteresis_point_id = energystoragecontainerhvac.heating_control_hysteresis_point.id;
			} else {
				energystoragecontainerhvac.heating_control_hysteresis_point_id = undefined;
			}
			if (energystoragecontainerhvac.cooling_on_temperature_point != null && energystoragecontainerhvac.cooling_on_temperature_point.id != null ) {
				energystoragecontainerhvac.cooling_on_temperature_point_id = energystoragecontainerhvac.cooling_on_temperature_point.id;
			} else {
				energystoragecontainerhvac.cooling_on_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.cooling_off_temperature_point != null && energystoragecontainerhvac.cooling_off_temperature_point.id != null ) {
				energystoragecontainerhvac.cooling_off_temperature_point_id = energystoragecontainerhvac.cooling_off_temperature_point.id;
			} else {
				energystoragecontainerhvac.cooling_off_temperature_point_id = undefined;
			}
			if (energystoragecontainerhvac.cooling_control_hysteresis_point != null && energystoragecontainerhvac.cooling_control_hysteresis_point.id != null ) {
				energystoragecontainerhvac.cooling_control_hysteresis_point_id = energystoragecontainerhvac.cooling_control_hysteresis_point.id;
			} else {
				energystoragecontainerhvac.cooling_control_hysteresis_point_id = undefined;
			}
			if (energystoragecontainerhvac.high_temperature_alarm_set_point != null && energystoragecontainerhvac.high_temperature_alarm_set_point.id != null ) {
				energystoragecontainerhvac.high_temperature_alarm_set_point_id = energystoragecontainerhvac.high_temperature_alarm_set_point.id;
			} else {
				energystoragecontainerhvac.high_temperature_alarm_set_point_id = undefined;
			}
			if (energystoragecontainerhvac.low_temperature_alarm_set_point != null && energystoragecontainerhvac.low_temperature_alarm_set_point.id != null ) {
				energystoragecontainerhvac.low_temperature_alarm_set_point_id = energystoragecontainerhvac.low_temperature_alarm_set_point.id;
			} else {
				energystoragecontainerhvac.low_temperature_alarm_set_point_id = undefined;
			}
			if (energystoragecontainerhvac.high_humidity_alarm_set_point != null && energystoragecontainerhvac.high_humidity_alarm_set_point.id != null ) {
				energystoragecontainerhvac.high_humidity_alarm_set_point_id = energystoragecontainerhvac.high_humidity_alarm_set_point.id;
			} else {
				energystoragecontainerhvac.high_humidity_alarm_set_point_id = undefined;
			}


			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerHVACService.addEnergyStorageContainerHVAC($scope.currentEnergyStorageContainer.id, energystoragecontainerhvac, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerHVACChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerHVAC = function(energystoragecontainerhvac) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerhvac.model.html',
  			controller: 'ModalEditEnergyStorageContainerHVACCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerhvac: angular.copy(energystoragecontainerhvac),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerHVAC) {
			if (modifiedEnergyStorageContainerHVAC.working_status_point != null && modifiedEnergyStorageContainerHVAC.working_status_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.working_status_point_id = modifiedEnergyStorageContainerHVAC.working_status_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.working_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.indoor_fan_status_point != null && modifiedEnergyStorageContainerHVAC.indoor_fan_status_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.indoor_fan_status_point_id = modifiedEnergyStorageContainerHVAC.indoor_fan_status_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.indoor_fan_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.outdoor_fan_status_point != null && modifiedEnergyStorageContainerHVAC.outdoor_fan_status_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.outdoor_fan_status_point_id = modifiedEnergyStorageContainerHVAC.outdoor_fan_status_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.outdoor_fan_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.emergency_fan_status_point != null && modifiedEnergyStorageContainerHVAC.emergency_fan_status_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.emergency_fan_status_point_id = modifiedEnergyStorageContainerHVAC.emergency_fan_status_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.emergency_fan_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.compressor_status_point != null && modifiedEnergyStorageContainerHVAC.compressor_status_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.compressor_status_point_id = modifiedEnergyStorageContainerHVAC.compressor_status_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.compressor_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.electric_heating_status_point != null && modifiedEnergyStorageContainerHVAC.electric_heating_status_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.electric_heating_status_point_id = modifiedEnergyStorageContainerHVAC.electric_heating_status_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.electric_heating_status_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.coil_temperature_point != null && modifiedEnergyStorageContainerHVAC.coil_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.coil_temperature_point_id = modifiedEnergyStorageContainerHVAC.coil_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.coil_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.temperature_outside_point != null && modifiedEnergyStorageContainerHVAC.temperature_outside_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.temperature_outside_point_id = modifiedEnergyStorageContainerHVAC.temperature_outside_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.temperature_outside_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.temperature_inside_point != null && modifiedEnergyStorageContainerHVAC.temperature_inside_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.temperature_inside_point_id = modifiedEnergyStorageContainerHVAC.temperature_inside_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.temperature_inside_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.humidity_inside_point != null && modifiedEnergyStorageContainerHVAC.humidity_inside_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.humidity_inside_point_id = modifiedEnergyStorageContainerHVAC.humidity_inside_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.humidity_inside_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.condensation_temperature_point != null && modifiedEnergyStorageContainerHVAC.condensation_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.condensation_temperature_point_id = modifiedEnergyStorageContainerHVAC.condensation_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.condensation_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.defrosting_temperature_point != null && modifiedEnergyStorageContainerHVAC.defrosting_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.defrosting_temperature_point_id = modifiedEnergyStorageContainerHVAC.defrosting_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.defrosting_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.outlet_air_temperature_point != null && modifiedEnergyStorageContainerHVAC.outlet_air_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.outlet_air_temperature_point_id = modifiedEnergyStorageContainerHVAC.outlet_air_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.outlet_air_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.return_air_temperature_point != null && modifiedEnergyStorageContainerHVAC.return_air_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.return_air_temperature_point_id = modifiedEnergyStorageContainerHVAC.return_air_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.return_air_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.exhaust_temperature_point != null && modifiedEnergyStorageContainerHVAC.exhaust_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.exhaust_temperature_point_id = modifiedEnergyStorageContainerHVAC.exhaust_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.exhaust_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.heating_on_temperature_point != null && modifiedEnergyStorageContainerHVAC.heating_on_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.heating_on_temperature_point_id = modifiedEnergyStorageContainerHVAC.heating_on_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.heating_on_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.heating_off_temperature_point != null && modifiedEnergyStorageContainerHVAC.heating_off_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.heating_off_temperature_point_id = modifiedEnergyStorageContainerHVAC.heating_off_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.heating_off_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.heating_control_hysteresis_point != null && modifiedEnergyStorageContainerHVAC.heating_control_hysteresis_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.heating_control_hysteresis_point_id = modifiedEnergyStorageContainerHVAC.heating_control_hysteresis_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.heating_control_hysteresis_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.cooling_on_temperature_point != null && modifiedEnergyStorageContainerHVAC.cooling_on_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.cooling_on_temperature_point_id = modifiedEnergyStorageContainerHVAC.cooling_on_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.cooling_on_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.cooling_off_temperature_point != null && modifiedEnergyStorageContainerHVAC.cooling_off_temperature_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.cooling_off_temperature_point_id = modifiedEnergyStorageContainerHVAC.cooling_off_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.cooling_off_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.cooling_control_hysteresis_point != null && modifiedEnergyStorageContainerHVAC.cooling_control_hysteresis_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.cooling_control_hysteresis_point_id = modifiedEnergyStorageContainerHVAC.cooling_control_hysteresis_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.cooling_control_hysteresis_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.high_temperature_alarm_set_point != null && modifiedEnergyStorageContainerHVAC.high_temperature_alarm_set_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.high_temperature_alarm_set_point_id = modifiedEnergyStorageContainerHVAC.high_temperature_alarm_set_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.high_temperature_alarm_set_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.low_temperature_alarm_set_point != null && modifiedEnergyStorageContainerHVAC.low_temperature_alarm_set_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.low_temperature_alarm_set_point_id = modifiedEnergyStorageContainerHVAC.low_temperature_alarm_set_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.low_temperature_alarm_set_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerHVAC.high_humidity_alarm_set_point != null && modifiedEnergyStorageContainerHVAC.high_humidity_alarm_set_point.id != null ) {
				modifiedEnergyStorageContainerHVAC.high_humidity_alarm_set_point_id = modifiedEnergyStorageContainerHVAC.high_humidity_alarm_set_point.id;
			} else {
				modifiedEnergyStorageContainerHVAC.high_humidity_alarm_set_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerHVACService.editEnergyStorageContainerHVAC($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerHVAC, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerHVACChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
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

  	$scope.deleteEnergyStorageContainerHVAC = function(energystoragecontainerhvac) {
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
  					EnergyStorageContainerHVACService.deleteEnergyStorageContainerHVAC($scope.currentEnergyStorageContainer.id, energystoragecontainerhvac.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerHVACChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
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
    $scope.$on('handleBroadcastEnergyStorageContainerChanged', function(event) {
      $scope.getAllEnergyStorageContainers();
  	});

  });


  app.controller('ModalAddEnergyStorageContainerHVACCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_HVAC";
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerhvac);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerHVACCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_HVAC";
  	$scope.energystoragecontainerhvac = params.energystoragecontainerhvac;
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerhvac);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
