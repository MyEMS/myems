'use strict';

app.controller('EnergyStoragePowerStationLoadController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStoragePowerStationService,
	EnergyStoragePowerStationLoadService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.energystoragepowerstations = [];
      $scope.energystoragepowerstationloads = [];
	  $scope.points = [];
	  $scope.meters = [];
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
  	$scope.getEnergyStoragePowerStationLoadsByEnergyStoragePowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStoragePowerStationLoadService.getEnergyStoragePowerStationLoadsByEnergyStoragePowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragepowerstationloads = response.data;
			} else {
          	$scope.energystoragepowerstationloads=[];
        }
			});
  	};

  	$scope.changeEnergyStoragePowerStation=function(item,model){
    	$scope.currentEnergyStoragePowerStation=item;
    	$scope.currentEnergyStoragePowerStation.selected=model;
        $scope.is_show_add_energystoragepowerstation_load = true;
    	$scope.getEnergyStoragePowerStationLoadsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
  	};

  	$scope.addEnergyStoragePowerStationLoad = function() {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstationload.model.html',
  			controller: 'ModalAddEnergyStoragePowerStationLoadCtrl',
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
  		modalInstance.result.then(function(energystoragepowerstationload) {
			energystoragepowerstationload.power_point_id = energystoragepowerstationload.power_point.id;
			energystoragepowerstationload.meter_id = energystoragepowerstationload.meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStoragePowerStationLoadService.addEnergyStoragePowerStationLoad($scope.currentEnergyStoragePowerStation.id, energystoragepowerstationload, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStoragePowerStationLoadsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
            		$scope.$emit('handleEmitEnergyStoragePowerStationLoadChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStoragePowerStationLoad = function(energystoragepowerstationload) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstationload.model.html',
  			controller: 'ModalEditEnergyStoragePowerStationLoadCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragepowerstationload: angular.copy(energystoragepowerstationload),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStoragePowerStationLoad) {
			modifiedEnergyStoragePowerStationLoad.power_point_id = modifiedEnergyStoragePowerStationLoad.power_point.id;
			modifiedEnergyStoragePowerStationLoad.meter_id = modifiedEnergyStoragePowerStationLoad.meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStoragePowerStationLoadService.editEnergyStoragePowerStationLoad($scope.currentEnergyStoragePowerStation.id, modifiedEnergyStoragePowerStationLoad, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStoragePowerStationLoadsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
            		$scope.$emit('handleEmitEnergyStoragePowerStationLoadChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
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

  	$scope.deleteEnergyStoragePowerStationLoad = function(energystoragepowerstationload) {
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
  					EnergyStoragePowerStationLoadService.deleteEnergyStoragePowerStationLoad($scope.currentEnergyStoragePowerStation.id, energystoragepowerstationload.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
								showCloseButton: true,
							});
							$scope.getEnergyStoragePowerStationLoadsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
							$scope.$emit('handleEmitEnergyStoragePowerStationLoadChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
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
    $scope.$on('handleBroadcastEnergyStoragePowerStationChanged', function(event) {
      $scope.getAllEnergyStoragePowerStations();
  	});

  });


  app.controller('ModalAddEnergyStoragePowerStationLoadCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_LOAD";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragepowerstationload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStoragePowerStationLoadCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_LOAD";
  	$scope.energystoragepowerstationload = params.energystoragepowerstationload;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragepowerstationload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
