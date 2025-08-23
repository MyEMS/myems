'use strict';

app.controller('PhotovoltaicPowerStationGridController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	PhotovoltaicPowerStationService,
	PhotovoltaicPowerStationGridService,
	PhotovoltaicPowerStationDataSourceService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.photovoltaicpowerstations = [];
      $scope.photovoltaicpowerstationgrids = [];
	  $scope.meters = [];
	  $scope.points = [];
      $scope.currentPhotovoltaicPowerStation = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.getAllPhotovoltaicPowerStations = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		PhotovoltaicPowerStationService.getAllPhotovoltaicPowerStations(headers, function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.photovoltaicpowerstations = response.data;
  			} else {
  				$scope.photovoltaicpowerstations = [];
  			}
  		});
  	};

    $scope.getDataSourcesByPhotovoltaicPowerStationID = function(id) {
      let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
      PhotovoltaicPowerStationDataSourceService.getDataSourcesByPhotovoltaicPowerStationID(id, headers, function(response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.datasources = response.data;
        } else {
          $scope.datasources = [];
        }
      });
    };

    $scope.getDataSourcePointsByPhotovoltaicPowerStationID = function(id) {
      let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
      PhotovoltaicPowerStationDataSourceService.getDataSourcePointsByPhotovoltaicPowerStationID(id, headers, function(response) {
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

  	$scope.getPhotovoltaicPowerStationGridsByPhotovoltaicPowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		PhotovoltaicPowerStationGridService.getPhotovoltaicPowerStationGridsByPhotovoltaicPowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.photovoltaicpowerstationgrids = response.data;
			} else {
          	$scope.photovoltaicpowerstationgrids=[];
        }
			});
  	};

  	$scope.changePhotovoltaicPowerStation=function(item,model){
    	$scope.currentPhotovoltaicPowerStation=item;
    	$scope.currentPhotovoltaicPowerStation.selected=model;
        $scope.is_show_add_photovoltaicpowerstation_grid = true;
    	$scope.getPhotovoltaicPowerStationGridsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
    	$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
        $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  	};

  	$scope.addPhotovoltaicPowerStationGrid = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/photovoltaicpowerstation/photovoltaicpowerstationgrid.model.html',
  			controller: 'ModalAddPhotovoltaicPowerStationGridCtrl',
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
  		modalInstance.result.then(function(photovoltaicpowerstationgrid) {
			photovoltaicpowerstationgrid.power_point_id = photovoltaicpowerstationgrid.power_point.id;
			photovoltaicpowerstationgrid.buy_meter_id = photovoltaicpowerstationgrid.buy_meter.id;
			photovoltaicpowerstationgrid.sell_meter_id = photovoltaicpowerstationgrid.sell_meter.id;
			if (photovoltaicpowerstationgrid.total_active_power_point != null && photovoltaicpowerstationgrid.total_active_power_point.id != null ) {
				photovoltaicpowerstationgrid.total_active_power_point_id = photovoltaicpowerstationgrid.total_active_power_point.id;
			} else {
				photovoltaicpowerstationgrid.total_active_power_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.active_power_a_point != null && photovoltaicpowerstationgrid.active_power_a_point.id != null ) {
				photovoltaicpowerstationgrid.active_power_a_point_id = photovoltaicpowerstationgrid.active_power_a_point.id;
			} else {
				photovoltaicpowerstationgrid.active_power_a_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.active_power_b_point != null && photovoltaicpowerstationgrid.active_power_b_point.id != null ) {
				photovoltaicpowerstationgrid.active_power_b_point_id = photovoltaicpowerstationgrid.active_power_b_point.id;
			} else {
				photovoltaicpowerstationgrid.active_power_b_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.active_power_c_point != null && photovoltaicpowerstationgrid.active_power_c_point.id != null ) {
				photovoltaicpowerstationgrid.active_power_c_point_id = photovoltaicpowerstationgrid.active_power_c_point.id;
			} else {
				photovoltaicpowerstationgrid.active_power_c_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.total_reactive_power_point != null && photovoltaicpowerstationgrid.total_reactive_power_point.id != null ) {
				photovoltaicpowerstationgrid.total_reactive_power_point_id = photovoltaicpowerstationgrid.total_reactive_power_point.id;
			} else {
				photovoltaicpowerstationgrid.total_reactive_power_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.reactive_power_a_point != null && photovoltaicpowerstationgrid.reactive_power_a_point.id != null ) {
				photovoltaicpowerstationgrid.reactive_power_a_point_id = photovoltaicpowerstationgrid.reactive_power_a_point.id;
			} else {
				photovoltaicpowerstationgrid.reactive_power_a_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.reactive_power_b_point != null && photovoltaicpowerstationgrid.reactive_power_b_point.id != null ) {
				photovoltaicpowerstationgrid.reactive_power_b_point_id = photovoltaicpowerstationgrid.reactive_power_b_point.id;
			} else {
				photovoltaicpowerstationgrid.reactive_power_b_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.reactive_power_c_point != null && photovoltaicpowerstationgrid.reactive_power_c_point.id != null ) {
				photovoltaicpowerstationgrid.reactive_power_c_point_id = photovoltaicpowerstationgrid.reactive_power_c_point.id;
			} else {
				photovoltaicpowerstationgrid.reactive_power_c_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.total_apparent_power_point != null && photovoltaicpowerstationgrid.total_apparent_power_point.id != null ) {
				photovoltaicpowerstationgrid.total_apparent_power_point_id = photovoltaicpowerstationgrid.total_apparent_power_point.id;
			} else {
				photovoltaicpowerstationgrid.total_apparent_power_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.apparent_power_a_point != null && photovoltaicpowerstationgrid.apparent_power_a_point.id != null ) {
				photovoltaicpowerstationgrid.apparent_power_a_point_id = photovoltaicpowerstationgrid.apparent_power_a_point.id;
			} else {
				photovoltaicpowerstationgrid.apparent_power_a_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.apparent_power_b_point != null && photovoltaicpowerstationgrid.apparent_power_b_point.id != null ) {
				photovoltaicpowerstationgrid.apparent_power_b_point_id = photovoltaicpowerstationgrid.apparent_power_b_point.id;
			} else {
				photovoltaicpowerstationgrid.apparent_power_b_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.apparent_power_c_point != null && photovoltaicpowerstationgrid.apparent_power_c_point.id != null ) {
				photovoltaicpowerstationgrid.apparent_power_c_point_id = photovoltaicpowerstationgrid.apparent_power_c_point.id;
			} else {
				photovoltaicpowerstationgrid.apparent_power_c_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.total_power_factor_point != null && photovoltaicpowerstationgrid.total_power_factor_point.id != null ) {
				photovoltaicpowerstationgrid.total_power_factor_point_id = photovoltaicpowerstationgrid.total_power_factor_point.id;
			} else {
				photovoltaicpowerstationgrid.total_power_factor_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.active_energy_import_point != null && photovoltaicpowerstationgrid.active_energy_import_point.id != null ) {
				photovoltaicpowerstationgrid.active_energy_import_point_id = photovoltaicpowerstationgrid.active_energy_import_point.id;
			} else {
				photovoltaicpowerstationgrid.active_energy_import_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.active_energy_export_point != null && photovoltaicpowerstationgrid.active_energy_export_point.id != null ) {
				photovoltaicpowerstationgrid.active_energy_export_point_id = photovoltaicpowerstationgrid.active_energy_export_point.id;
			} else {
				photovoltaicpowerstationgrid.active_energy_export_point_id = undefined;
			}
			if (photovoltaicpowerstationgrid.active_energy_net_point != null && photovoltaicpowerstationgrid.active_energy_net_point.id != null ) {
				photovoltaicpowerstationgrid.active_energy_net_point_id = photovoltaicpowerstationgrid.active_energy_net_point.id;
			} else {
				photovoltaicpowerstationgrid.active_energy_net_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			PhotovoltaicPowerStationGridService.addPhotovoltaicPowerStationGrid($scope.currentPhotovoltaicPowerStation.id, photovoltaicpowerstationgrid, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.GRID")}),
  						showCloseButton: true,
  					});
  					$scope.getPhotovoltaicPowerStationGridsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  					$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
                    $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
            		$scope.$emit('handleEmitPhotovoltaicPowerStationGridChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.GRID")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editPhotovoltaicPowerStationGrid = function(photovoltaicpowerstationgrid) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/photovoltaicpowerstation/photovoltaicpowerstationgrid.model.html',
  			controller: 'ModalEditPhotovoltaicPowerStationGridCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						photovoltaicpowerstationgrid: angular.copy(photovoltaicpowerstationgrid),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedPhotovoltaicPowerStationGrid) {
			modifiedPhotovoltaicPowerStationGrid.power_point_id = modifiedPhotovoltaicPowerStationGrid.power_point.id;
			modifiedPhotovoltaicPowerStationGrid.buy_meter_id = modifiedPhotovoltaicPowerStationGrid.buy_meter.id;
			modifiedPhotovoltaicPowerStationGrid.sell_meter_id = modifiedPhotovoltaicPowerStationGrid.sell_meter.id;

			if (modifiedPhotovoltaicPowerStationGrid.total_active_power_point != null && modifiedPhotovoltaicPowerStationGrid.total_active_power_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.total_active_power_point_id = modifiedPhotovoltaicPowerStationGrid.total_active_power_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.total_active_power_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.active_power_a_point != null && modifiedPhotovoltaicPowerStationGrid.active_power_a_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.active_power_a_point_id = modifiedPhotovoltaicPowerStationGrid.active_power_a_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.active_power_a_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.active_power_b_point != null && modifiedPhotovoltaicPowerStationGrid.active_power_b_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.active_power_b_point_id = modifiedPhotovoltaicPowerStationGrid.active_power_b_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.active_power_b_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.active_power_c_point != null && modifiedPhotovoltaicPowerStationGrid.active_power_c_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.active_power_c_point_id = modifiedPhotovoltaicPowerStationGrid.active_power_c_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.active_power_c_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.total_reactive_power_point != null && modifiedPhotovoltaicPowerStationGrid.total_reactive_power_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.total_reactive_power_point_id = modifiedPhotovoltaicPowerStationGrid.total_reactive_power_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.total_reactive_power_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.reactive_power_a_point != null && modifiedPhotovoltaicPowerStationGrid.reactive_power_a_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.reactive_power_a_point_id = modifiedPhotovoltaicPowerStationGrid.reactive_power_a_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.reactive_power_a_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.reactive_power_b_point != null && modifiedPhotovoltaicPowerStationGrid.reactive_power_b_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.reactive_power_b_point_id = modifiedPhotovoltaicPowerStationGrid.reactive_power_b_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.reactive_power_b_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.reactive_power_c_point != null && modifiedPhotovoltaicPowerStationGrid.reactive_power_c_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.reactive_power_c_point_id = modifiedPhotovoltaicPowerStationGrid.reactive_power_c_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.reactive_power_c_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.total_apparent_power_point != null && modifiedPhotovoltaicPowerStationGrid.total_apparent_power_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.total_apparent_power_point_id = modifiedPhotovoltaicPowerStationGrid.total_apparent_power_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.total_apparent_power_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.apparent_power_a_point != null && modifiedPhotovoltaicPowerStationGrid.apparent_power_a_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.apparent_power_a_point_id = modifiedPhotovoltaicPowerStationGrid.apparent_power_a_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.apparent_power_a_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.apparent_power_b_point != null && modifiedPhotovoltaicPowerStationGrid.apparent_power_b_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.apparent_power_b_point_id = modifiedPhotovoltaicPowerStationGrid.apparent_power_b_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.apparent_power_b_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.apparent_power_c_point != null && modifiedPhotovoltaicPowerStationGrid.apparent_power_c_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.apparent_power_c_point_id = modifiedPhotovoltaicPowerStationGrid.apparent_power_c_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.apparent_power_c_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.total_power_factor_point != null && modifiedPhotovoltaicPowerStationGrid.total_power_factor_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.total_power_factor_point_id = modifiedPhotovoltaicPowerStationGrid.total_power_factor_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.total_power_factor_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.active_energy_import_point != null && modifiedPhotovoltaicPowerStationGrid.active_energy_import_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.active_energy_import_point_id = modifiedPhotovoltaicPowerStationGrid.active_energy_import_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.active_energy_import_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.active_energy_export_point != null && modifiedPhotovoltaicPowerStationGrid.active_energy_export_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.active_energy_export_point_id = modifiedPhotovoltaicPowerStationGrid.active_energy_export_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.active_energy_export_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationGrid.active_energy_net_point != null && modifiedPhotovoltaicPowerStationGrid.active_energy_net_point.id != null ) {
				modifiedPhotovoltaicPowerStationGrid.active_energy_net_point_id = modifiedPhotovoltaicPowerStationGrid.active_energy_net_point.id;
			} else {
				modifiedPhotovoltaicPowerStationGrid.active_energy_net_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			PhotovoltaicPowerStationGridService.editPhotovoltaicPowerStationGrid($scope.currentPhotovoltaicPowerStation.id, modifiedPhotovoltaicPowerStationGrid, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.GRID")}),
  						showCloseButton: true,
  					});
  					$scope.getPhotovoltaicPowerStationGridsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  					$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
                    $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
            		$scope.$emit('handleEmitPhotovoltaicPowerStationGridChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.GRID")}),
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

  	$scope.deletePhotovoltaicPowerStationGrid = function(photovoltaicpowerstationgrid) {
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
  					PhotovoltaicPowerStationGridService.deletePhotovoltaicPowerStationGrid($scope.currentPhotovoltaicPowerStation.id, photovoltaicpowerstationgrid.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.GRID")}),
								showCloseButton: true,
							});
							$scope.getPhotovoltaicPowerStationGridsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
							$scope.$emit('handleEmitPhotovoltaicPowerStationGridChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.GRID")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

    $scope.bindPhotovoltaicPowerStationGridPoint = function (grid) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/photovoltaicpowerstation/photovoltaicpowerstationgridpoint.model.html",
        controller: "ModalBindPhotovoltaicPowerStationGridCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              photovoltaicpowerstationid: $scope.currentPhotovoltaicPowerStation.id,
              photovoltaicpowerstationgrid: angular.copy(grid),
              meters: angular.copy($scope.meters),
              datasources: angular.copy($scope.datasources),
              points: angular.copy($scope.points),
            };
          },
        },
      });
      $rootScope.modalInstance = modalInstance;
    };

  	$scope.getAllPhotovoltaicPowerStations();
	$scope.getAllMeters();
    $scope.$on('handleBroadcastPhotovoltaicPowerStationChanged', function(event) {
      $scope.getAllPhotovoltaicPowerStations();
  	});

  });


  app.controller('ModalAddPhotovoltaicPowerStationGridCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "PHOTOVOLTAIC_POWER_STATION.ADD_GRID";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.photovoltaicpowerstationgrid);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditPhotovoltaicPowerStationGridCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "PHOTOVOLTAIC_POWER_STATION.EDIT_GRID";
  	$scope.photovoltaicpowerstationgrid = params.photovoltaicpowerstationgrid;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.photovoltaicpowerstationgrid);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller(
  "ModalBindPhotovoltaicPowerStationGridCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    PhotovoltaicPowerStationGridService,
    PointService,
    params
  ) {
    $scope.operation = "PHOTOVOLTAIC_POWER_STATION.EDIT_GRID";
    $scope.photovoltaicpowerstationid = params.photovoltaicpowerstationid;
    $scope.photovoltaicpowerstationgrid = params.photovoltaicpowerstationgrid;
    $scope.datasources = params.datasources;
    $scope.boundpoints = [];

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    PhotovoltaicPowerStationGridService.getPointsByGridID(
      $scope.photovoltaicpowerstationid,
      $scope.photovoltaicpowerstationgrid.id,
      headers,
      function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.boundpoints = response.data;
        } else {
          $scope.boundpoints = [];
        }
      }
    );

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };

    $scope.changeDataSource = function (item, model) {
      $scope.currentDataSource = model;
      $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getPointsByDataSourceID = function (id) {
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      PointService.getPointsByDataSourceID(id, headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.points = response.data;
        } else {
          $scope.points = [];
        }
      });
    };

    $scope.pairPoint = function (dragEl, dropEl) {
      var pointid = angular.element("#" + dragEl).scope().point.id;
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      PhotovoltaicPowerStationGridService.addPair(
        params.photovoltaicpowerstationid,
        params.photovoltaicpowerstationgrid.id,
        pointid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
              showCloseButton: true,
            });
            let headers = {
              "User-UUID": params.user_uuid,
              Token: params.token,
            };
            PhotovoltaicPowerStationGridService.getPointsByGridID(
              params.photovoltaicpowerstationid,
              params.photovoltaicpowerstationgrid.id,
              headers,
              function (response) {
                if (
                  angular.isDefined(response.status) &&
                  response.status === 200
                ) {
                  $scope.boundpoints = response.data;
                } else {
                  $scope.boundpoints = [];
                }
              }
            );
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };

    $scope.deletePointPair = function (dragEl, dropEl) {
      if (angular.element("#" + dragEl).hasClass("source")) {
        return;
      }

      var pointid = angular.element("#" + dragEl).scope().boundpoint.id;
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      PhotovoltaicPowerStationGridService.deletePair(
        params.photovoltaicpowerstationid,
        params.photovoltaicpowerstationgrid.id,
        pointid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
              showCloseButton: true,
            });
            let headers = {
              "User-UUID": params.user_uuid,
              Token: params.token,
            };
            PhotovoltaicPowerStationGridService.getPointsByGridID(
              params.photovoltaicpowerstationid,
              params.photovoltaicpowerstationgrid.id,
              headers,
              function (response) {
                if (
                  angular.isDefined(response.status) &&
                  response.status === 200
                ) {
                  $scope.boundpoints = response.data;
                } else {
                  $scope.boundpoints = [];
                }
              }
            );
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };
  }
);

