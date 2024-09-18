'use strict';

app.controller('EnergyStorageContainerFirecontrolController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerFirecontrolService,
	PointService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerfirecontrols = [];
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

  	$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerFirecontrolService.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerfirecontrols = response.data;
			} else {
          	$scope.energystoragecontainerfirecontrols=[];
        }
			});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_firecontrol = true;
    	$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerFirecontrol = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerfirecontrol.model.html',
  			controller: 'ModalAddEnergyStorageContainerFirecontrolCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energystoragecontainerfirecontrol) {
			if (energystoragecontainerfirecontrol.inside_temperature_point != null && energystoragecontainerfirecontrol.inside_temperature_point.id != null ) {
				energystoragecontainerfirecontrol.inside_temperature_point_id = energystoragecontainerfirecontrol.inside_temperature_point.id;
			} else {
				energystoragecontainerfirecontrol.inside_temperature_point_id = undefined;
			}
			if (energystoragecontainerfirecontrol.outside_temperature_point != null && energystoragecontainerfirecontrol.outside_temperature_point.id != null ) {
				energystoragecontainerfirecontrol.outside_temperature_point_id = energystoragecontainerfirecontrol.outside_temperature_point.id;
			} else {
				energystoragecontainerfirecontrol.outside_temperature_point_id = undefined;
			}
			if (energystoragecontainerfirecontrol.temperature_alarm_point != null && energystoragecontainerfirecontrol.temperature_alarm_point.id != null ) {
				energystoragecontainerfirecontrol.temperature_alarm_point_id = energystoragecontainerfirecontrol.temperature_alarm_point.id;
			} else {
				energystoragecontainerfirecontrol.temperature_alarm_point_id = undefined;
			}
			if (energystoragecontainerfirecontrol.smoke_sensor_value_point != null && energystoragecontainerfirecontrol.smoke_sensor_value_point.id != null ) {
				energystoragecontainerfirecontrol.smoke_sensor_value_point_id = energystoragecontainerfirecontrol.smoke_sensor_value_point.id;
			} else {
				energystoragecontainerfirecontrol.smoke_sensor_value_point_id = undefined;
			}
			if (energystoragecontainerfirecontrol.smoke_sensor_alarm_point != null && energystoragecontainerfirecontrol.smoke_sensor_alarm_point.id != null ) {
				energystoragecontainerfirecontrol.smoke_sensor_alarm_point_id = energystoragecontainerfirecontrol.smoke_sensor_alarm_point.id;
			} else {
				energystoragecontainerfirecontrol.smoke_sensor_alarm_point_id = undefined;
			}
			if (energystoragecontainerfirecontrol.battery_safety_detection_sensor_value_point != null && energystoragecontainerfirecontrol.battery_safety_detection_sensor_value_point.id != null ) {
				energystoragecontainerfirecontrol.battery_safety_detection_sensor_value_point_id = energystoragecontainerfirecontrol.battery_safety_detection_sensor_value_point.id;
			} else {
				energystoragecontainerfirecontrol.battery_safety_detection_sensor_value_point_id = undefined;
			}
			if (energystoragecontainerfirecontrol.battery_safety_detection_sensor_alarm_point != null && energystoragecontainerfirecontrol.battery_safety_detection_sensor_alarm_point.id != null ) {
				energystoragecontainerfirecontrol.battery_safety_detection_sensor_alarm_point_id = energystoragecontainerfirecontrol.battery_safety_detection_sensor_alarm_point.id;
			} else {
				energystoragecontainerfirecontrol.battery_safety_detection_sensor_alarm_point_id = undefined;
			}
			if (energystoragecontainerfirecontrol.fire_extinguishing_device_status_point != null && energystoragecontainerfirecontrol.fire_extinguishing_device_status_point.id != null ) {
				energystoragecontainerfirecontrol.fire_extinguishing_device_status_point_id = energystoragecontainerfirecontrol.fire_extinguishing_device_status_point.id;
			} else {
				energystoragecontainerfirecontrol.fire_extinguishing_device_status_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerFirecontrolService.addEnergyStorageContainerFirecontrol($scope.currentEnergyStorageContainer.id, energystoragecontainerfirecontrol, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerFirecontrolChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerFirecontrol = function(energystoragecontainerfirecontrol) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerfirecontrol.model.html',
  			controller: 'ModalEditEnergyStorageContainerFirecontrolCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerfirecontrol: angular.copy(energystoragecontainerfirecontrol),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerFirecontrol) {
			if (modifiedEnergyStorageContainerFirecontrol.inside_temperature_point != null && modifiedEnergyStorageContainerFirecontrol.inside_temperature_point.id != null ) {
				modifiedEnergyStorageContainerFirecontrol.inside_temperature_point_id = modifiedEnergyStorageContainerFirecontrol.inside_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerFirecontrol.inside_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerFirecontrol.outside_temperature_point != null && modifiedEnergyStorageContainerFirecontrol.outside_temperature_point.id != null ) {
				modifiedEnergyStorageContainerFirecontrol.outside_temperature_point_id = modifiedEnergyStorageContainerFirecontrol.outside_temperature_point.id;
			} else {
				modifiedEnergyStorageContainerFirecontrol.outside_temperature_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerFirecontrol.temperature_alarm_point != null && modifiedEnergyStorageContainerFirecontrol.temperature_alarm_point.id != null ) {
				modifiedEnergyStorageContainerFirecontrol.temperature_alarm_point_id = modifiedEnergyStorageContainerFirecontrol.temperature_alarm_point.id;
			} else {
				modifiedEnergyStorageContainerFirecontrol.temperature_alarm_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerFirecontrol.smoke_sensor_value_point != null && modifiedEnergyStorageContainerFirecontrol.smoke_sensor_value_point.id != null ) {
				modifiedEnergyStorageContainerFirecontrol.smoke_sensor_value_point_id = modifiedEnergyStorageContainerFirecontrol.smoke_sensor_value_point.id;
			} else {
				modifiedEnergyStorageContainerFirecontrol.smoke_sensor_value_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerFirecontrol.smoke_sensor_alarm_point != null && modifiedEnergyStorageContainerFirecontrol.smoke_sensor_alarm_point.id != null ) {
				modifiedEnergyStorageContainerFirecontrol.smoke_sensor_alarm_point_id = modifiedEnergyStorageContainerFirecontrol.smoke_sensor_alarm_point.id;
			} else {
				modifiedEnergyStorageContainerFirecontrol.smoke_sensor_alarm_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_value_point != null && modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_value_point.id != null ) {
				modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_value_point_id = modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_value_point.id;
			} else {
				modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_value_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_alarm_point != null && modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_alarm_point.id != null ) {
				modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_alarm_point_id = modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_alarm_point.id;
			} else {
				modifiedEnergyStorageContainerFirecontrol.battery_safety_detection_sensor_alarm_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerFirecontrol.fire_extinguishing_device_status_point != null && modifiedEnergyStorageContainerFirecontrol.fire_extinguishing_device_status_point.id != null ) {
				modifiedEnergyStorageContainerFirecontrol.fire_extinguishing_device_status_point_id = modifiedEnergyStorageContainerFirecontrol.fire_extinguishing_device_status_point.id;
			} else {
				modifiedEnergyStorageContainerFirecontrol.fire_extinguishing_device_status_point_id = undefined;
			}



			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerFirecontrolService.editEnergyStorageContainerFirecontrol($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerFirecontrol, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerFirecontrolChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
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

  	$scope.deleteEnergyStorageContainerFirecontrol = function(energystoragecontainerfirecontrol) {
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
  					EnergyStorageContainerFirecontrolService.deleteEnergyStorageContainerFirecontrol($scope.currentEnergyStorageContainer.id, energystoragecontainerfirecontrol.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerFirecontrolChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
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


  app.controller('ModalAddEnergyStorageContainerFirecontrolCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_FIRECONTROL";
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerfirecontrol);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerFirecontrolCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_FIRECONTROL";
  	$scope.energystoragecontainerfirecontrol = params.energystoragecontainerfirecontrol;
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerfirecontrol);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
