'use strict';

app.controller('EnergyStorageContainerGridController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerGridService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainergrids = [];
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
  	$scope.getEnergyStorageContainerGridsByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerGridService.getEnergyStorageContainerGridsByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainergrids = response.data;
			} else {
          	$scope.energystoragecontainergrids=[];
        }
			});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_grid = true;
    	$scope.getEnergyStorageContainerGridsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerGrid = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainergrid.model.html',
  			controller: 'ModalAddEnergyStorageContainerGridCtrl',
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
  		modalInstance.result.then(function(energystoragecontainergrid) {
			energystoragecontainergrid.power_point_id = energystoragecontainergrid.power_point.id;
			energystoragecontainergrid.buy_meter_id = energystoragecontainergrid.buy_meter.id;
			energystoragecontainergrid.sell_meter_id = energystoragecontainergrid.sell_meter.id;
			if (energystoragecontainergrid.total_active_power_point != null && energystoragecontainergrid.total_active_power_point.id != null ) {
				energystoragecontainergrid.total_active_power_point_id = energystoragecontainergrid.total_active_power_point.id;
			} else {
				energystoragecontainergrid.total_active_power_point_id = undefined;
			}
			if (energystoragecontainergrid.active_power_a_point != null && energystoragecontainergrid.active_power_a_point.id != null ) {
				energystoragecontainergrid.active_power_a_point_id = energystoragecontainergrid.active_power_a_point.id;
			} else {
				energystoragecontainergrid.active_power_a_point_id = undefined;
			}
			if (energystoragecontainergrid.active_power_b_point != null && energystoragecontainergrid.active_power_b_point.id != null ) {
				energystoragecontainergrid.active_power_b_point_id = energystoragecontainergrid.active_power_b_point.id;
			} else {
				energystoragecontainergrid.active_power_b_point_id = undefined;
			}
			if (energystoragecontainergrid.active_power_c_point != null && energystoragecontainergrid.active_power_c_point.id != null ) {
				energystoragecontainergrid.active_power_c_point_id = energystoragecontainergrid.active_power_c_point.id;
			} else {
				energystoragecontainergrid.active_power_c_point_id = undefined;
			}
			if (energystoragecontainergrid.total_reactive_power_point != null && energystoragecontainergrid.total_reactive_power_point.id != null ) {
				energystoragecontainergrid.total_reactive_power_point_id = energystoragecontainergrid.total_reactive_power_point.id;
			} else {
				energystoragecontainergrid.total_reactive_power_point_id = undefined;
			}
			if (energystoragecontainergrid.reactive_power_a_point != null && energystoragecontainergrid.reactive_power_a_point.id != null ) {
				energystoragecontainergrid.reactive_power_a_point_id = energystoragecontainergrid.reactive_power_a_point.id;
			} else {
				energystoragecontainergrid.reactive_power_a_point_id = undefined;
			}
			if (energystoragecontainergrid.reactive_power_b_point != null && energystoragecontainergrid.reactive_power_b_point.id != null ) {
				energystoragecontainergrid.reactive_power_b_point_id = energystoragecontainergrid.reactive_power_b_point.id;
			} else {
				energystoragecontainergrid.reactive_power_b_point_id = undefined;
			}
			if (energystoragecontainergrid.reactive_power_c_point != null && energystoragecontainergrid.reactive_power_c_point.id != null ) {
				energystoragecontainergrid.reactive_power_c_point_id = energystoragecontainergrid.reactive_power_c_point.id;
			} else {
				energystoragecontainergrid.reactive_power_c_point_id = undefined;
			}
			if (energystoragecontainergrid.total_apparent_power_point != null && energystoragecontainergrid.total_apparent_power_point.id != null ) {
				energystoragecontainergrid.total_apparent_power_point_id = energystoragecontainergrid.total_apparent_power_point.id;
			} else {
				energystoragecontainergrid.total_apparent_power_point_id = undefined;
			}
			if (energystoragecontainergrid.apparent_power_a_point != null && energystoragecontainergrid.apparent_power_a_point.id != null ) {
				energystoragecontainergrid.apparent_power_a_point_id = energystoragecontainergrid.apparent_power_a_point.id;
			} else {
				energystoragecontainergrid.apparent_power_a_point_id = undefined;
			}
			if (energystoragecontainergrid.apparent_power_b_point != null && energystoragecontainergrid.apparent_power_b_point.id != null ) {
				energystoragecontainergrid.apparent_power_b_point_id = energystoragecontainergrid.apparent_power_b_point.id;
			} else {
				energystoragecontainergrid.apparent_power_b_point_id = undefined;
			}
			if (energystoragecontainergrid.apparent_power_c_point != null && energystoragecontainergrid.apparent_power_c_point.id != null ) {
				energystoragecontainergrid.apparent_power_c_point_id = energystoragecontainergrid.apparent_power_c_point.id;
			} else {
				energystoragecontainergrid.apparent_power_c_point_id = undefined;
			}
			if (energystoragecontainergrid.total_power_factor_point != null && energystoragecontainergrid.total_power_factor_point.id != null ) {
				energystoragecontainergrid.total_power_factor_point_id = energystoragecontainergrid.total_power_factor_point.id;
			} else {
				energystoragecontainergrid.total_power_factor_point_id = undefined;
			}
			if (energystoragecontainergrid.active_energy_import_point != null && energystoragecontainergrid.active_energy_import_point.id != null ) {
				energystoragecontainergrid.active_energy_import_point_id = energystoragecontainergrid.active_energy_import_point.id;
			} else {
				energystoragecontainergrid.active_energy_import_point_id = undefined;
			}
			if (energystoragecontainergrid.active_energy_export_point != null && energystoragecontainergrid.active_energy_export_point.id != null ) {
				energystoragecontainergrid.active_energy_export_point_id = energystoragecontainergrid.active_energy_export_point.id;
			} else {
				energystoragecontainergrid.active_energy_export_point_id = undefined;
			}
			if (energystoragecontainergrid.active_energy_net_point != null && energystoragecontainergrid.active_energy_net_point.id != null ) {
				energystoragecontainergrid.active_energy_net_point_id = energystoragecontainergrid.active_energy_net_point.id;
			} else {
				energystoragecontainergrid.active_energy_net_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerGridService.addEnergyStorageContainerGrid($scope.currentEnergyStorageContainer.id, energystoragecontainergrid, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerGridsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerGridChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerGrid = function(energystoragecontainergrid) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainergrid.model.html',
  			controller: 'ModalEditEnergyStorageContainerGridCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainergrid: angular.copy(energystoragecontainergrid),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerGrid) {
			modifiedEnergyStorageContainerGrid.power_point_id = modifiedEnergyStorageContainerGrid.power_point.id;
			modifiedEnergyStorageContainerGrid.buy_meter_id = modifiedEnergyStorageContainerGrid.buy_meter.id;
			modifiedEnergyStorageContainerGrid.sell_meter_id = modifiedEnergyStorageContainerGrid.sell_meter.id;

			if (modifiedEnergyStorageContainerGrid.total_active_power_point != null && modifiedEnergyStorageContainerGrid.total_active_power_point.id != null ) {
				modifiedEnergyStorageContainerGrid.total_active_power_point_id = modifiedEnergyStorageContainerGrid.total_active_power_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.total_active_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.active_power_a_point != null && modifiedEnergyStorageContainerGrid.active_power_a_point.id != null ) {
				modifiedEnergyStorageContainerGrid.active_power_a_point_id = modifiedEnergyStorageContainerGrid.active_power_a_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.active_power_a_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.active_power_b_point != null && modifiedEnergyStorageContainerGrid.active_power_b_point.id != null ) {
				modifiedEnergyStorageContainerGrid.active_power_b_point_id = modifiedEnergyStorageContainerGrid.active_power_b_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.active_power_b_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.active_power_c_point != null && modifiedEnergyStorageContainerGrid.active_power_c_point.id != null ) {
				modifiedEnergyStorageContainerGrid.active_power_c_point_id = modifiedEnergyStorageContainerGrid.active_power_c_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.active_power_c_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.total_reactive_power_point != null && modifiedEnergyStorageContainerGrid.total_reactive_power_point.id != null ) {
				modifiedEnergyStorageContainerGrid.total_reactive_power_point_id = modifiedEnergyStorageContainerGrid.total_reactive_power_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.total_reactive_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.reactive_power_a_point != null && modifiedEnergyStorageContainerGrid.reactive_power_a_point.id != null ) {
				modifiedEnergyStorageContainerGrid.reactive_power_a_point_id = modifiedEnergyStorageContainerGrid.reactive_power_a_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.reactive_power_a_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.reactive_power_b_point != null && modifiedEnergyStorageContainerGrid.reactive_power_b_point.id != null ) {
				modifiedEnergyStorageContainerGrid.reactive_power_b_point_id = modifiedEnergyStorageContainerGrid.reactive_power_b_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.reactive_power_b_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.reactive_power_c_point != null && modifiedEnergyStorageContainerGrid.reactive_power_c_point.id != null ) {
				modifiedEnergyStorageContainerGrid.reactive_power_c_point_id = modifiedEnergyStorageContainerGrid.reactive_power_c_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.reactive_power_c_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.total_apparent_power_point != null && modifiedEnergyStorageContainerGrid.total_apparent_power_point.id != null ) {
				modifiedEnergyStorageContainerGrid.total_apparent_power_point_id = modifiedEnergyStorageContainerGrid.total_apparent_power_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.total_apparent_power_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.apparent_power_a_point != null && modifiedEnergyStorageContainerGrid.apparent_power_a_point.id != null ) {
				modifiedEnergyStorageContainerGrid.apparent_power_a_point_id = modifiedEnergyStorageContainerGrid.apparent_power_a_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.apparent_power_a_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.apparent_power_b_point != null && modifiedEnergyStorageContainerGrid.apparent_power_b_point.id != null ) {
				modifiedEnergyStorageContainerGrid.apparent_power_b_point_id = modifiedEnergyStorageContainerGrid.apparent_power_b_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.apparent_power_b_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.apparent_power_c_point != null && modifiedEnergyStorageContainerGrid.apparent_power_c_point.id != null ) {
				modifiedEnergyStorageContainerGrid.apparent_power_c_point_id = modifiedEnergyStorageContainerGrid.apparent_power_c_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.apparent_power_c_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.total_power_factor_point != null && modifiedEnergyStorageContainerGrid.total_power_factor_point.id != null ) {
				modifiedEnergyStorageContainerGrid.total_power_factor_point_id = modifiedEnergyStorageContainerGrid.total_power_factor_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.total_power_factor_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.active_energy_import_point != null && modifiedEnergyStorageContainerGrid.active_energy_import_point.id != null ) {
				modifiedEnergyStorageContainerGrid.active_energy_import_point_id = modifiedEnergyStorageContainerGrid.active_energy_import_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.active_energy_import_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.active_energy_export_point != null && modifiedEnergyStorageContainerGrid.active_energy_export_point.id != null ) {
				modifiedEnergyStorageContainerGrid.active_energy_export_point_id = modifiedEnergyStorageContainerGrid.active_energy_export_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.active_energy_export_point_id = undefined;
			}
			if (modifiedEnergyStorageContainerGrid.active_energy_net_point != null && modifiedEnergyStorageContainerGrid.active_energy_net_point.id != null ) {
				modifiedEnergyStorageContainerGrid.active_energy_net_point_id = modifiedEnergyStorageContainerGrid.active_energy_net_point.id;
			} else {
				modifiedEnergyStorageContainerGrid.active_energy_net_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerGridService.editEnergyStorageContainerGrid($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerGrid, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerGridsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerGridChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID")}),
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

  	$scope.deleteEnergyStorageContainerGrid = function(energystoragecontainergrid) {
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
  					EnergyStorageContainerGridService.deleteEnergyStorageContainerGrid($scope.currentEnergyStorageContainer.id, energystoragecontainergrid.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerGridsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerGridChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID")}),
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


  app.controller('ModalAddEnergyStorageContainerGridCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_GRID";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainergrid);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerGridCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_GRID";
  	$scope.energystoragecontainergrid = params.energystoragecontainergrid;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainergrid);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
