'use strict';

app.controller('EnergyStorageContainerLoadController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerLoadService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerloads = [];
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
  	$scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerLoadService.getEnergyStorageContainerLoadsByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerloads = response.data;
			} else {
          	$scope.energystoragecontainerloads=[];
        }
			});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_load = true;
    	$scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerLoad = function() {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerload.model.html',
  			controller: 'ModalAddEnergyStorageContainerLoadCtrl',
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
  		modalInstance.result.then(function(energystoragecontainerload) {
			energystoragecontainerload.power_point_id = energystoragecontainerload.power_point.id;
			energystoragecontainerload.meter_id = energystoragecontainerload.meter.id;
			if (energystoragecontainerload.total_active_power_point != null && energystoragecontainerload.total_active_power_point.id != null ) {
				energystoragecontainerload.total_active_power_point_id = energystoragecontainerload.total_active_power_point.id;
			} else {
				energystoragecontainerload.total_active_power_point_id = undefined;
			}
			if (energystoragecontainerload.active_power_a_point != null && energystoragecontainerload.active_power_a_point.id != null ) {
				energystoragecontainerload.active_power_a_point_id = energystoragecontainerload.active_power_a_point.id;
			} else {
				energystoragecontainerload.active_power_a_point_id = undefined;
			}
			if (energystoragecontainerload.active_power_b_point != null && energystoragecontainerload.active_power_b_point.id != null ) {
				energystoragecontainerload.active_power_b_point_id = energystoragecontainerload.active_power_b_point.id;
			} else {
				energystoragecontainerload.active_power_b_point_id = undefined;
			}
			if (energystoragecontainerload.active_power_c_point != null && energystoragecontainerload.active_power_c_point.id != null ) {
				energystoragecontainerload.active_power_c_point_id = energystoragecontainerload.active_power_c_point.id;
			} else {
				energystoragecontainerload.active_power_c_point_id = undefined;
			}
			if (energystoragecontainerload.total_reactive_power_point != null && energystoragecontainerload.total_reactive_power_point.id != null ) {
				energystoragecontainerload.total_reactive_power_point_id = energystoragecontainerload.total_reactive_power_point.id;
			} else {
				energystoragecontainerload.total_reactive_power_point_id = undefined;
			}
			if (energystoragecontainerload.reactive_power_a_point != null && energystoragecontainerload.reactive_power_a_point.id != null ) {
				energystoragecontainerload.reactive_power_a_point_id = energystoragecontainerload.reactive_power_a_point.id;
			} else {
				energystoragecontainerload.reactive_power_a_point_id = undefined;
			}
			if (energystoragecontainerload.reactive_power_b_point != null && energystoragecontainerload.reactive_power_b_point.id != null ) {
				energystoragecontainerload.reactive_power_b_point_id = energystoragecontainerload.reactive_power_b_point.id;
			} else {
				energystoragecontainerload.reactive_power_b_point_id = undefined;
			}
			if (energystoragecontainerload.reactive_power_c_point != null && energystoragecontainerload.reactive_power_c_point.id != null ) {
				energystoragecontainerload.reactive_power_c_point_id = energystoragecontainerload.reactive_power_c_point.id;
			} else {
				energystoragecontainerload.reactive_power_c_point_id = undefined;
			}
			if (energystoragecontainerload.total_apparent_power_point != null && energystoragecontainerload.total_apparent_power_point.id != null ) {
				energystoragecontainerload.total_apparent_power_point_id = energystoragecontainerload.total_apparent_power_point.id;
			} else {
				energystoragecontainerload.total_apparent_power_point_id = undefined;
			}
			if (energystoragecontainerload.apparent_power_a_point != null && energystoragecontainerload.apparent_power_a_point.id != null ) {
				energystoragecontainerload.apparent_power_a_point_id = energystoragecontainerload.apparent_power_a_point.id;
			} else {
				energystoragecontainerload.apparent_power_a_point_id = undefined;
			}
			if (energystoragecontainerload.apparent_power_b_point != null && energystoragecontainerload.apparent_power_b_point.id != null ) {
				energystoragecontainerload.apparent_power_b_point_id = energystoragecontainerload.apparent_power_b_point.id;
			} else {
				energystoragecontainerload.apparent_power_b_point_id = undefined;
			}
			if (energystoragecontainerload.apparent_power_c_point != null && energystoragecontainerload.apparent_power_c_point.id != null ) {
				energystoragecontainerload.apparent_power_c_point_id = energystoragecontainerload.apparent_power_c_point.id;
			} else {
				energystoragecontainerload.apparent_power_c_point_id = undefined;
			}
			if (energystoragecontainerload.total_power_factor_point != null && energystoragecontainerload.total_power_factor_point.id != null ) {
				energystoragecontainerload.total_power_factor_point_id = energystoragecontainerload.total_power_factor_point.id;
			} else {
				energystoragecontainerload.total_power_factor_point_id = undefined;
			}
			if (energystoragecontainerload.active_energy_import_point != null && energystoragecontainerload.active_energy_import_point.id != null ) {
				energystoragecontainerload.active_energy_import_point_id = energystoragecontainerload.active_energy_import_point.id;
			} else {
				energystoragecontainerload.active_energy_import_point_id = undefined;
			}
			if (energystoragecontainerload.active_energy_export_point != null && energystoragecontainerload.active_energy_export_point.id != null ) {
				energystoragecontainerload.active_energy_export_point_id = energystoragecontainerload.active_energy_export_point.id;
			} else {
				energystoragecontainerload.active_energy_export_point_id = undefined;
			}
			if (energystoragecontainerload.active_energy_net_point != null && energystoragecontainerload.active_energy_net_point.id != null ) {
				energystoragecontainerload.active_energy_net_point_id = energystoragecontainerload.active_energy_net_point.id;
			} else {
				energystoragecontainerload.active_energy_net_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerLoadService.addEnergyStorageContainerLoad($scope.currentEnergyStorageContainer.id, energystoragecontainerload, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerLoadChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerLoad = function(energystoragecontainerload) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerload.model.html',
  			controller: 'ModalEditEnergyStorageContainerLoadCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerload: angular.copy(energystoragecontainerload),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerLoad) {
			modifiedEnergyStorageContainerLoad.power_point_id = modifiedEnergyStorageContainerLoad.power_point.id;
			modifiedEnergyStorageContainerLoad.meter_id = modifiedEnergyStorageContainerLoad.meter.id;

			if (modifiedEnergyStorageContainerLoad.total_active_power_point != null && modifiedEnergyStorageContainerLoad.total_active_power_point.id != null ) {
				modifiedEnergyStorageContainerLoad.total_active_power_point_id = modifiedEnergyStorageContainerLoad.total_active_power_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.total_active_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.active_power_a_point != null && modifiedEnergyStorageContainerLoad.active_power_a_point.id != null ) {
				modifiedEnergyStorageContainerLoad.active_power_a_point_id = modifiedEnergyStorageContainerLoad.active_power_a_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.active_power_a_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.active_power_b_point != null && modifiedEnergyStorageContainerLoad.active_power_b_point.id != null ) {
				modifiedEnergyStorageContainerLoad.active_power_b_point_id = modifiedEnergyStorageContainerLoad.active_power_b_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.active_power_b_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.active_power_c_point != null && modifiedEnergyStorageContainerLoad.active_power_c_point.id != null ) {
				modifiedEnergyStorageContainerLoad.active_power_c_point_id = modifiedEnergyStorageContainerLoad.active_power_c_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.active_power_c_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.total_reactive_power_point != null && modifiedEnergyStorageContainerLoad.total_reactive_power_point.id != null ) {
				modifiedEnergyStorageContainerLoad.total_reactive_power_point_id = modifiedEnergyStorageContainerLoad.total_reactive_power_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.total_reactive_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.reactive_power_a_point != null && modifiedEnergyStorageContainerLoad.reactive_power_a_point.id != null ) {
				modifiedEnergyStorageContainerLoad.reactive_power_a_point_id = modifiedEnergyStorageContainerLoad.reactive_power_a_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.reactive_power_a_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.reactive_power_b_point != null && modifiedEnergyStorageContainerLoad.reactive_power_b_point.id != null ) {
				modifiedEnergyStorageContainerLoad.reactive_power_b_point_id = modifiedEnergyStorageContainerLoad.reactive_power_b_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.reactive_power_b_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.reactive_power_c_point != null && modifiedEnergyStorageContainerLoad.reactive_power_c_point.id != null ) {
				modifiedEnergyStorageContainerLoad.reactive_power_c_point_id = modifiedEnergyStorageContainerLoad.reactive_power_c_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.reactive_power_c_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.total_apparent_power_point != null && modifiedEnergyStorageContainerLoad.total_apparent_power_point.id != null ) {
				modifiedEnergyStorageContainerLoad.total_apparent_power_point_id = modifiedEnergyStorageContainerLoad.total_apparent_power_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.total_apparent_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.apparent_power_a_point != null && modifiedEnergyStorageContainerLoad.apparent_power_a_point.id != null ) {
				modifiedEnergyStorageContainerLoad.apparent_power_a_point_id = modifiedEnergyStorageContainerLoad.apparent_power_a_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.apparent_power_a_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.apparent_power_b_point != null && modifiedEnergyStorageContainerLoad.apparent_power_b_point.id != null ) {
				modifiedEnergyStorageContainerLoad.apparent_power_b_point_id = modifiedEnergyStorageContainerLoad.apparent_power_b_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.apparent_power_b_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.apparent_power_c_point != null && modifiedEnergyStorageContainerLoad.apparent_power_c_point.id != null ) {
				modifiedEnergyStorageContainerLoad.apparent_power_c_point_id = modifiedEnergyStorageContainerLoad.apparent_power_c_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.apparent_power_c_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.total_power_factor_point != null && modifiedEnergyStorageContainerLoad.total_power_factor_point.id != null ) {
				modifiedEnergyStorageContainerLoad.total_power_factor_point_id = modifiedEnergyStorageContainerLoad.total_power_factor_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.total_power_factor_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.active_energy_import_point != null && modifiedEnergyStorageContainerLoad.active_energy_import_point.id != null ) {
				modifiedEnergyStorageContainerLoad.active_energy_import_point_id = modifiedEnergyStorageContainerLoad.active_energy_import_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.active_energy_import_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.active_energy_export_point != null && modifiedEnergyStorageContainerLoad.active_energy_export_point.id != null ) {
				modifiedEnergyStorageContainerLoad.active_energy_export_point_id = modifiedEnergyStorageContainerLoad.active_energy_export_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.active_energy_export_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerLoad.active_energy_net_point != null && modifiedEnergyStorageContainerLoad.active_energy_net_point.id != null ) {
				modifiedEnergyStorageContainerLoad.active_energy_net_point_id = modifiedEnergyStorageContainerLoad.active_energy_net_point.id;
			} else {
				modifiedEnergyStorageContainerLoad.active_energy_net_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerLoadService.editEnergyStorageContainerLoad($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerLoad, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerLoadChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD")}),
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

  	$scope.deleteEnergyStorageContainerLoad = function(energystoragecontainerload) {
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
  					EnergyStorageContainerLoadService.deleteEnergyStorageContainerLoad($scope.currentEnergyStorageContainer.id, energystoragecontainerload.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerLoadChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD")}),
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


  app.controller('ModalAddEnergyStorageContainerLoadCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_LOAD";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerLoadCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_LOAD";
  	$scope.energystoragecontainerload = params.energystoragecontainerload;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
