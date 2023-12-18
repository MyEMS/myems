'use strict';

app.controller('EnergyStoragePowerStationPowerconversionsystemController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStoragePowerStationService,
	EnergyStoragePowerStationPowerconversionsystemService,
	PointService,
	MeterService,
	CommandService,
	toaster,
	SweetAlert) {
      $scope.energystoragepowerstations = [];
      $scope.energystoragepowerstationpowerconversionsystems = [];
	  $scope.meters = [];
	  $scope.points = [];
	  $scope.commands = [];
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
  	$scope.getEnergyStoragePowerStationPowerconversionsystemsByEnergyStoragePowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStoragePowerStationPowerconversionsystemService.getEnergyStoragePowerStationPowerconversionsystemsByEnergyStoragePowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragepowerstationpowerconversionsystems = response.data;
			} else {
          		$scope.energystoragepowerstationpowerconversionsystems=[];
        	}
		});
  	};

  	$scope.changeEnergyStoragePowerStation=function(item,model){
    	$scope.currentEnergyStoragePowerStation=item;
    	$scope.currentEnergyStoragePowerStation.selected=model;
        $scope.is_show_add_energystoragepowerstation_powerconversionsystem = true;
    	$scope.getEnergyStoragePowerStationPowerconversionsystemsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
  	};

  	$scope.addEnergyStoragePowerStationPowerconversionsystem = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstationpowerconversionsystem.model.html',
  			controller: 'ModalAddEnergyStoragePowerStationPowerconversionsystemCtrl',
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
  		modalInstance.result.then(function(energystoragepowerstationpowerconversionsystem) {
			energystoragepowerstationpowerconversionsystem.run_state_point_id = energystoragepowerstationpowerconversionsystem.run_state_point.id;
			energystoragepowerstationpowerconversionsystem.charge_start_time1_point_id = energystoragepowerstationpowerconversionsystem.charge_start_time1_point.id;
			energystoragepowerstationpowerconversionsystem.charge_end_time1_point_id = energystoragepowerstationpowerconversionsystem.charge_end_time1_point.id;
			energystoragepowerstationpowerconversionsystem.charge_start_time2_point_id = energystoragepowerstationpowerconversionsystem.charge_start_time2_point.id;
			energystoragepowerstationpowerconversionsystem.charge_end_time2_point_id = energystoragepowerstationpowerconversionsystem.charge_end_time2_point.id;
			energystoragepowerstationpowerconversionsystem.charge_start_time3_point_id = energystoragepowerstationpowerconversionsystem.charge_start_time3_point.id;
			energystoragepowerstationpowerconversionsystem.charge_end_time3_point_id = energystoragepowerstationpowerconversionsystem.charge_end_time3_point.id;
			energystoragepowerstationpowerconversionsystem.charge_start_time4_point_id = energystoragepowerstationpowerconversionsystem.charge_start_time4_point.id;
			energystoragepowerstationpowerconversionsystem.charge_end_time4_point_id = energystoragepowerstationpowerconversionsystem.charge_end_time4_point.id;
			energystoragepowerstationpowerconversionsystem.discharge_start_time1_point_id = energystoragepowerstationpowerconversionsystem.discharge_start_time1_point.id;
			energystoragepowerstationpowerconversionsystem.discharge_end_time1_point_id = energystoragepowerstationpowerconversionsystem.discharge_end_time1_point.id;
			energystoragepowerstationpowerconversionsystem.discharge_start_time2_point_id = energystoragepowerstationpowerconversionsystem.discharge_start_time2_point.id;
			energystoragepowerstationpowerconversionsystem.discharge_end_time2_point_id = energystoragepowerstationpowerconversionsystem.discharge_end_time2_point.id;
			energystoragepowerstationpowerconversionsystem.discharge_start_time3_point_id = energystoragepowerstationpowerconversionsystem.discharge_start_time3_point.id;
			energystoragepowerstationpowerconversionsystem.discharge_end_time3_point_id = energystoragepowerstationpowerconversionsystem.discharge_end_time3_point.id;
			energystoragepowerstationpowerconversionsystem.discharge_start_time4_point_id = energystoragepowerstationpowerconversionsystem.discharge_start_time4_point.id;
			energystoragepowerstationpowerconversionsystem.discharge_end_time4_point_id = energystoragepowerstationpowerconversionsystem.discharge_end_time4_point.id;
			energystoragepowerstationpowerconversionsystem.charge_start_time1_command_id = energystoragepowerstationpowerconversionsystem.charge_start_time1_command.id;
			energystoragepowerstationpowerconversionsystem.charge_end_time1_command_id = energystoragepowerstationpowerconversionsystem.charge_end_time1_command.id;
			energystoragepowerstationpowerconversionsystem.charge_start_time2_command_id = energystoragepowerstationpowerconversionsystem.charge_start_time2_command.id;
			energystoragepowerstationpowerconversionsystem.charge_end_time2_command_id = energystoragepowerstationpowerconversionsystem.charge_end_time2_command.id;
			energystoragepowerstationpowerconversionsystem.charge_start_time3_command_id = energystoragepowerstationpowerconversionsystem.charge_start_time3_command.id;
			energystoragepowerstationpowerconversionsystem.charge_end_time3_command_id = energystoragepowerstationpowerconversionsystem.charge_end_time3_command.id;
			energystoragepowerstationpowerconversionsystem.charge_start_time4_command_id = energystoragepowerstationpowerconversionsystem.charge_start_time4_command.id;
			energystoragepowerstationpowerconversionsystem.charge_end_time4_command_id = energystoragepowerstationpowerconversionsystem.charge_end_time4_command.id;
			energystoragepowerstationpowerconversionsystem.discharge_start_time1_command_id = energystoragepowerstationpowerconversionsystem.discharge_start_time1_command.id;
			energystoragepowerstationpowerconversionsystem.discharge_end_time1_command_id = energystoragepowerstationpowerconversionsystem.discharge_end_time1_command.id;
			energystoragepowerstationpowerconversionsystem.discharge_start_time2_command_id = energystoragepowerstationpowerconversionsystem.discharge_start_time2_command.id;
			energystoragepowerstationpowerconversionsystem.discharge_end_time2_command_id = energystoragepowerstationpowerconversionsystem.discharge_end_time2_command.id;
			energystoragepowerstationpowerconversionsystem.discharge_start_time3_command_id = energystoragepowerstationpowerconversionsystem.discharge_start_time3_command.id;
			energystoragepowerstationpowerconversionsystem.discharge_end_time3_command_id = energystoragepowerstationpowerconversionsystem.discharge_end_time3_command.id;
			energystoragepowerstationpowerconversionsystem.discharge_start_time4_command_id = energystoragepowerstationpowerconversionsystem.discharge_start_time4_command.id;
			energystoragepowerstationpowerconversionsystem.discharge_end_time4_command_id = energystoragepowerstationpowerconversionsystem.discharge_end_time4_command.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStoragePowerStationPowerconversionsystemService.addEnergyStoragePowerStationPowerconversionsystem($scope.currentEnergyStoragePowerStation.id, energystoragepowerstationpowerconversionsystem, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStoragePowerStationPowerconversionsystemsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
            		$scope.$emit('handleEmitEnergyStoragePowerStationPowerconversionsystemChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStoragePowerStationPowerconversionsystem = function(energystoragepowerstationpowerconversionsystem) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstationpowerconversionsystem.model.html',
  			controller: 'ModalEditEnergyStoragePowerStationPowerconversionsystemCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragepowerstationpowerconversionsystem: angular.copy(energystoragepowerstationpowerconversionsystem),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
						commands: angular.copy($scope.commands),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStoragePowerStationPowerconversionsystem) {
			modifiedEnergyStoragePowerStationPowerconversionsystem.run_state_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.run_state_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time1_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time1_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time1_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time1_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time2_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time2_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time2_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time2_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time3_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time3_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time3_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time3_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time4_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time4_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time4_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time4_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time1_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time1_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time1_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time1_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time2_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time2_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time2_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time2_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time3_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time3_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time3_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time3_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time4_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time4_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time4_point_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time4_point.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time1_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time1_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time1_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time1_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time2_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time2_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time2_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time2_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time3_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time3_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time3_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time3_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time4_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_start_time4_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time4_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.charge_end_time4_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time1_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time1_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time1_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time1_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time2_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time2_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time2_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time2_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time3_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time3_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time3_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time3_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time4_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_start_time4_command.id;
			modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time4_command_id = modifiedEnergyStoragePowerStationPowerconversionsystem.discharge_end_time4_command.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStoragePowerStationPowerconversionsystemService.editEnergyStoragePowerStationPowerconversionsystem($scope.currentEnergyStoragePowerStation.id, modifiedEnergyStoragePowerStationPowerconversionsystem, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStoragePowerStationPowerconversionsystemsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
            		$scope.$emit('handleEmitEnergyStoragePowerStationPowerconversionsystemChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
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

  	$scope.deleteEnergyStoragePowerStationPowerconversionsystem = function(energystoragepowerstationpowerconversionsystem) {
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
  					EnergyStoragePowerStationPowerconversionsystemService.deleteEnergyStoragePowerStationPowerconversionsystem($scope.currentEnergyStoragePowerStation.id, energystoragepowerstationpowerconversionsystem.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
								showCloseButton: true,
							});
							$scope.getEnergyStoragePowerStationPowerconversionsystemsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
							$scope.$emit('handleEmitEnergyStoragePowerStationPowerconversionsystemChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
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
	$scope.getAllCommands();
    $scope.$on('handleBroadcastEnergyStoragePowerStationChanged', function(event) {
      $scope.getAllEnergyStoragePowerStations();
  	});

  });


  app.controller('ModalAddEnergyStoragePowerStationPowerconversionsystemCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_POWER_CONVERSION_SYSTEM";
	$scope.points=params.points;
	$scope.meters=params.meters;
	$scope.commands=params.commands;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragepowerstationpowerconversionsystem);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStoragePowerStationPowerconversionsystemCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_POWER_CONVERSION_SYSTEM";
  	$scope.energystoragepowerstationpowerconversionsystem = params.energystoragepowerstationpowerconversionsystem;
	$scope.points=params.points;
	$scope.meters=params.meters;
	$scope.commands=params.commands;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragepowerstationpowerconversionsystem);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
