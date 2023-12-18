'use strict';

app.controller('EnergyStoragePowerStationGridController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStoragePowerStationService,
	EnergyStoragePowerStationGridService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.energystoragepowerstations = [];
      $scope.energystoragepowerstationgrids = [];
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
  	$scope.getEnergyStoragePowerStationGridsByEnergyStoragePowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStoragePowerStationGridService.getEnergyStoragePowerStationGridsByEnergyStoragePowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragepowerstationgrids = response.data;
			} else {
          	$scope.energystoragepowerstationgrids=[];
        }
			});
  	};

  	$scope.changeEnergyStoragePowerStation=function(item,model){
    	$scope.currentEnergyStoragePowerStation=item;
    	$scope.currentEnergyStoragePowerStation.selected=model;
        $scope.is_show_add_energystoragepowerstation_grid = true;
    	$scope.getEnergyStoragePowerStationGridsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
  	};

  	$scope.addEnergyStoragePowerStationGrid = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstationgrid.model.html',
  			controller: 'ModalAddEnergyStoragePowerStationGridCtrl',
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
  		modalInstance.result.then(function(energystoragepowerstationgrid) {
			energystoragepowerstationgrid.power_point_id = energystoragepowerstationgrid.power_point.id;
			energystoragepowerstationgrid.buy_meter_id = energystoragepowerstationgrid.buy_meter.id;
			energystoragepowerstationgrid.sell_meter_id = energystoragepowerstationgrid.sell_meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStoragePowerStationGridService.addEnergyStoragePowerStationGrid($scope.currentEnergyStoragePowerStation.id, energystoragepowerstationgrid, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStoragePowerStationGridsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
            		$scope.$emit('handleEmitEnergyStoragePowerStationGridChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStoragePowerStationGrid = function(energystoragepowerstationgrid) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstationgrid.model.html',
  			controller: 'ModalEditEnergyStoragePowerStationGridCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragepowerstationgrid: angular.copy(energystoragepowerstationgrid),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStoragePowerStationGrid) {
			modifiedEnergyStoragePowerStationGrid.power_point_id = modifiedEnergyStoragePowerStationGrid.power_point.id;
			modifiedEnergyStoragePowerStationGrid.buy_meter_id = modifiedEnergyStoragePowerStationGrid.buy_meter.id;
			modifiedEnergyStoragePowerStationGrid.sell_meter_id = modifiedEnergyStoragePowerStationGrid.sell_meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStoragePowerStationGridService.editEnergyStoragePowerStationGrid($scope.currentEnergyStoragePowerStation.id, modifiedEnergyStoragePowerStationGrid, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStoragePowerStationGridsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
            		$scope.$emit('handleEmitEnergyStoragePowerStationGridChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
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

  	$scope.deleteEnergyStoragePowerStationGrid = function(energystoragepowerstationgrid) {
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
  					EnergyStoragePowerStationGridService.deleteEnergyStoragePowerStationGrid($scope.currentEnergyStoragePowerStation.id, energystoragepowerstationgrid.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
								showCloseButton: true,
							});
							$scope.getEnergyStoragePowerStationGridsByEnergyStoragePowerStationID($scope.currentEnergyStoragePowerStation.id);
							$scope.$emit('handleEmitEnergyStoragePowerStationGridChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
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


  app.controller('ModalAddEnergyStoragePowerStationGridCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_GRID";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragepowerstationgrid);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStoragePowerStationGridCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_GRID";
  	$scope.energystoragepowerstationgrid = params.energystoragepowerstationgrid;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragepowerstationgrid);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
