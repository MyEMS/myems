'use strict';

app.controller('MicrogridPowerconversionsystemController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridPowerconversionsystemService,
	PointService,
	MeterService,
	CommandService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridpowerconversionsystems = [];
	  $scope.meters = [];
	  $scope.points = [];
	  $scope.commands = [];
      $scope.currentMicrogrid = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.getAllMicrogrids = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		MicrogridService.getAllMicrogrids(headers, function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.microgrids = response.data;
  			} else {
  				$scope.microgrids = [];
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
  	$scope.getMicrogridPowerconversionsystemsByMicrogridID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		MicrogridPowerconversionsystemService.getMicrogridPowerconversionsystemsByMicrogridID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridpowerconversionsystems = response.data;
			} else {
          		$scope.microgridpowerconversionsystems=[];
        	}
		});
  	};

  	$scope.changeMicrogrid=function(item,model){
    	$scope.currentMicrogrid=item;
    	$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_powerconversionsystem = true;
    	$scope.getMicrogridPowerconversionsystemsByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridPowerconversionsystem = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridpowerconversionsystem.model.html',
  			controller: 'ModalAddMicrogridPowerconversionsystemCtrl',
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
  		modalInstance.result.then(function(microgridpowerconversionsystem) {
			microgridpowerconversionsystem.run_state_point_id = microgridpowerconversionsystem.run_state_point.id;
			microgridpowerconversionsystem.today_charge_energy_point_id = microgridpowerconversionsystem.today_charge_energy_point.id;
			microgridpowerconversionsystem.today_discharge_energy_point_id = microgridpowerconversionsystem.today_discharge_energy_point.id;
			microgridpowerconversionsystem.total_charge_energy_point_id = microgridpowerconversionsystem.total_charge_energy_point.id;
			microgridpowerconversionsystem.total_discharge_energy_point_id = microgridpowerconversionsystem.total_discharge_energy_point.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridPowerconversionsystemService.addMicrogridPowerconversionsystem($scope.currentMicrogrid.id, microgridpowerconversionsystem, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridPowerconversionsystemsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridPowerconversionsystemChanged');
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

  	$scope.editMicrogridPowerconversionsystem = function(microgridpowerconversionsystem) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridpowerconversionsystem.model.html',
  			controller: 'ModalEditMicrogridPowerconversionsystemCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridpowerconversionsystem: angular.copy(microgridpowerconversionsystem),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
						commands: angular.copy($scope.commands),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridPowerconversionsystem) {
			modifiedMicrogridPowerconversionsystem.run_state_point_id = modifiedMicrogridPowerconversionsystem.run_state_point.id;
			modifiedMicrogridPowerconversionsystem.today_charge_energy_point_id = modifiedMicrogridPowerconversionsystem.today_charge_energy_point.id;
			modifiedMicrogridPowerconversionsystem.today_discharge_energy_point_id = modifiedMicrogridPowerconversionsystem.today_discharge_energy_point.id;
			modifiedMicrogridPowerconversionsystem.total_charge_energy_point_id = modifiedMicrogridPowerconversionsystem.total_charge_energy_point.id;
			modifiedMicrogridPowerconversionsystem.total_discharge_energy_point_id = modifiedMicrogridPowerconversionsystem.total_discharge_energy_point.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridPowerconversionsystemService.editMicrogridPowerconversionsystem($scope.currentMicrogrid.id, modifiedMicrogridPowerconversionsystem, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridPowerconversionsystemsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridPowerconversionsystemChanged');
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

  	$scope.deleteMicrogridPowerconversionsystem = function(microgridpowerconversionsystem) {
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
  					MicrogridPowerconversionsystemService.deleteMicrogridPowerconversionsystem($scope.currentMicrogrid.id, microgridpowerconversionsystem.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_POWER_CONVERSION_SYSTEM")}),
								showCloseButton: true,
							});
							$scope.getMicrogridPowerconversionsystemsByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridPowerconversionsystemChanged');
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

  	$scope.getAllMicrogrids();
	$scope.getAllPoints();
	$scope.getAllMeters();
	$scope.getAllCommands();
    $scope.$on('handleBroadcastMicrogridChanged', function(event) {
      $scope.getAllMicrogrids();
  	});

  });


  app.controller('ModalAddMicrogridPowerconversionsystemCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_POWER_CONVERSION_SYSTEM";
	$scope.points=params.points;
	$scope.meters=params.meters;
	$scope.commands=params.commands;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridpowerconversionsystem);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridPowerconversionsystemCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_POWER_CONVERSION_SYSTEM";
  	$scope.microgridpowerconversionsystem = params.microgridpowerconversionsystem;
	$scope.points=params.points;
	$scope.meters=params.meters;
	$scope.commands=params.commands;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridpowerconversionsystem);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
