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
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridpowerconversionsystems = [];
	  $scope.points = [];
	  $scope.meters = [];
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
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridpowerconversionsystem) {
        	microgridpowerconversionsystem.microgrid_id = $scope.currentMicrogrid.id;
			microgridpowerconversionsystem.run_state_point_id = microgridpowerconversionsystem.run_state_point.id;
			microgridpowerconversionsystem.charge_start_time1_point_id = microgridpowerconversionsystem.charge_start_time1_point.id;
			microgridpowerconversionsystem.charge_end_time1_point_id = microgridpowerconversionsystem.charge_end_time1_point.id;
			microgridpowerconversionsystem.charge_start_time2_point_id = microgridpowerconversionsystem.charge_start_time2_point.id;
			microgridpowerconversionsystem.charge_end_time2_point_id = microgridpowerconversionsystem.charge_end_time2_point.id;
			microgridpowerconversionsystem.charge_start_time3_point_id = microgridpowerconversionsystem.charge_start_time3_point.id;
			microgridpowerconversionsystem.charge_end_time3_point_id = microgridpowerconversionsystem.charge_end_time3_point.id;
			microgridpowerconversionsystem.charge_start_time4_point_id = microgridpowerconversionsystem.charge_start_time4_point.id;
			microgridpowerconversionsystem.charge_end_time4_point_id = microgridpowerconversionsystem.charge_end_time4_point.id;
			microgridpowerconversionsystem.discharge_start_time1_point_id = microgridpowerconversionsystem.discharge_start_time1_point.id;
			microgridpowerconversionsystem.discharge_end_time1_point_id = microgridpowerconversionsystem.discharge_end_time1_point.id;
			microgridpowerconversionsystem.discharge_start_time2_point_id = microgridpowerconversionsystem.discharge_start_time2_point.id;
			microgridpowerconversionsystem.discharge_end_time2_point_id = microgridpowerconversionsystem.discharge_end_time2_point.id;
			microgridpowerconversionsystem.discharge_start_time3_point_id = microgridpowerconversionsystem.discharge_start_time3_point.id;
			microgridpowerconversionsystem.discharge_end_time3_point_id = microgridpowerconversionsystem.discharge_end_time3_point.id;
			microgridpowerconversionsystem.discharge_start_time4_point_id = microgridpowerconversionsystem.discharge_start_time4_point.id;
			microgridpowerconversionsystem.discharge_end_time4_point_id = microgridpowerconversionsystem.discharge_end_time4_point.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridPowerconversionsystemService.addMicrogridPowerconversionsystem(microgridpowerconversionsystem, headers, function (response) {
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
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridPowerconversionsystem) {
        	modifiedMicrogridPowerconversionsystem.microgrid_id = $scope.currentMicrogrid.id;
			modifiedMicrogridPowerconversionsystem.run_state_point_id = modifiedMicrogridPowerconversionsystem.run_state_point.id;
			modifiedMicrogridPowerconversionsystem.charge_start_time1_point_id = modifiedMicrogridPowerconversionsystem.charge_start_time1_point.id;
			modifiedMicrogridPowerconversionsystem.charge_end_time1_point_id = modifiedMicrogridPowerconversionsystem.charge_end_time1_point.id;
			modifiedMicrogridPowerconversionsystem.charge_start_time2_point_id = modifiedMicrogridPowerconversionsystem.charge_start_time2_point.id;
			modifiedMicrogridPowerconversionsystem.charge_end_time2_point_id = modifiedMicrogridPowerconversionsystem.charge_end_time2_point.id;
			modifiedMicrogridPowerconversionsystem.charge_start_time3_point_id = modifiedMicrogridPowerconversionsystem.charge_start_time3_point.id;
			modifiedMicrogridPowerconversionsystem.charge_end_time3_point_id = modifiedMicrogridPowerconversionsystem.charge_end_time3_point.id;
			modifiedMicrogridPowerconversionsystem.charge_start_time4_point_id = modifiedMicrogridPowerconversionsystem.charge_start_time4_point.id;
			modifiedMicrogridPowerconversionsystem.charge_end_time4_point_id = modifiedMicrogridPowerconversionsystem.charge_end_time4_point.id;
			modifiedMicrogridPowerconversionsystem.discharge_start_time1_point_id = modifiedMicrogridPowerconversionsystem.discharge_start_time1_point.id;
			modifiedMicrogridPowerconversionsystem.discharge_end_time1_point_id = modifiedMicrogridPowerconversionsystem.discharge_end_time1_point.id;
			modifiedMicrogridPowerconversionsystem.discharge_start_time2_point_id = modifiedMicrogridPowerconversionsystem.discharge_start_time2_point.id;
			modifiedMicrogridPowerconversionsystem.discharge_end_time2_point_id = modifiedMicrogridPowerconversionsystem.discharge_end_time2_point.id;
			modifiedMicrogridPowerconversionsystem.discharge_start_time3_point_id = modifiedMicrogridPowerconversionsystem.discharge_start_time3_point.id;
			modifiedMicrogridPowerconversionsystem.discharge_end_time3_point_id = modifiedMicrogridPowerconversionsystem.discharge_end_time3_point.id;
			modifiedMicrogridPowerconversionsystem.discharge_start_time4_point_id = modifiedMicrogridPowerconversionsystem.discharge_start_time4_point.id;
			modifiedMicrogridPowerconversionsystem.discharge_end_time4_point_id = modifiedMicrogridPowerconversionsystem.discharge_end_time4_point.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridPowerconversionsystemService.editMicrogridPowerconversionsystem(modifiedMicrogridPowerconversionsystem, headers, function (response) {
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
  					MicrogridPowerconversionsystemService.deleteMicrogridPowerconversionsystem(microgridpowerconversionsystem.id, headers, function (response) {
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
    $scope.$on('handleBroadcastMicrogridChanged', function(event) {
      $scope.getAllMicrogrids();
  	});

  });


  app.controller('ModalAddMicrogridPowerconversionsystemCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_POWER_CONVERSION_SYSTEM";
	$scope.points=params.points;
	$scope.meters=params.meters;
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
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridpowerconversionsystem);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
