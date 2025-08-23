'use strict';

app.controller('PhotovoltaicPowerStationLoadController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	PhotovoltaicPowerStationService,
	PhotovoltaicPowerStationLoadService,
	PhotovoltaicPowerStationDataSourceService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.photovoltaicpowerstations = [];
      $scope.photovoltaicpowerstationloads = [];
	  $scope.points = [];
	  $scope.meters = [];
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
  	$scope.getPhotovoltaicPowerStationLoadsByPhotovoltaicPowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		PhotovoltaicPowerStationLoadService.getPhotovoltaicPowerStationLoadsByPhotovoltaicPowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.photovoltaicpowerstationloads = response.data;
			} else {
          	$scope.photovoltaicpowerstationloads=[];
        }
			});
  	};

  	$scope.changePhotovoltaicPowerStation=function(item,model){
    	$scope.currentPhotovoltaicPowerStation=item;
    	$scope.currentPhotovoltaicPowerStation.selected=model;
        $scope.is_show_add_photovoltaicpowerstation_load = true;
    	$scope.getPhotovoltaicPowerStationLoadsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
    	$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
        $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  	};

  	$scope.addPhotovoltaicPowerStationLoad = function() {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/photovoltaicpowerstation/photovoltaicpowerstationload.model.html',
  			controller: 'ModalAddPhotovoltaicPowerStationLoadCtrl',
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
  		modalInstance.result.then(function(photovoltaicpowerstationload) {
			photovoltaicpowerstationload.power_point_id = photovoltaicpowerstationload.power_point.id;
			photovoltaicpowerstationload.meter_id = photovoltaicpowerstationload.meter.id;
			if (photovoltaicpowerstationload.total_active_power_point != null && photovoltaicpowerstationload.total_active_power_point.id != null ) {
				photovoltaicpowerstationload.total_active_power_point_id = photovoltaicpowerstationload.total_active_power_point.id;
			} else {
				photovoltaicpowerstationload.total_active_power_point_id = undefined;
			}
			if (photovoltaicpowerstationload.active_power_a_point != null && photovoltaicpowerstationload.active_power_a_point.id != null ) {
				photovoltaicpowerstationload.active_power_a_point_id = photovoltaicpowerstationload.active_power_a_point.id;
			} else {
				photovoltaicpowerstationload.active_power_a_point_id = undefined;
			}
			if (photovoltaicpowerstationload.active_power_b_point != null && photovoltaicpowerstationload.active_power_b_point.id != null ) {
				photovoltaicpowerstationload.active_power_b_point_id = photovoltaicpowerstationload.active_power_b_point.id;
			} else {
				photovoltaicpowerstationload.active_power_b_point_id = undefined;
			}
			if (photovoltaicpowerstationload.active_power_c_point != null && photovoltaicpowerstationload.active_power_c_point.id != null ) {
				photovoltaicpowerstationload.active_power_c_point_id = photovoltaicpowerstationload.active_power_c_point.id;
			} else {
				photovoltaicpowerstationload.active_power_c_point_id = undefined;
			}
			if (photovoltaicpowerstationload.total_reactive_power_point != null && photovoltaicpowerstationload.total_reactive_power_point.id != null ) {
				photovoltaicpowerstationload.total_reactive_power_point_id = photovoltaicpowerstationload.total_reactive_power_point.id;
			} else {
				photovoltaicpowerstationload.total_reactive_power_point_id = undefined;
			}
			if (photovoltaicpowerstationload.reactive_power_a_point != null && photovoltaicpowerstationload.reactive_power_a_point.id != null ) {
				photovoltaicpowerstationload.reactive_power_a_point_id = photovoltaicpowerstationload.reactive_power_a_point.id;
			} else {
				photovoltaicpowerstationload.reactive_power_a_point_id = undefined;
			}
			if (photovoltaicpowerstationload.reactive_power_b_point != null && photovoltaicpowerstationload.reactive_power_b_point.id != null ) {
				photovoltaicpowerstationload.reactive_power_b_point_id = photovoltaicpowerstationload.reactive_power_b_point.id;
			} else {
				photovoltaicpowerstationload.reactive_power_b_point_id = undefined;
			}
			if (photovoltaicpowerstationload.reactive_power_c_point != null && photovoltaicpowerstationload.reactive_power_c_point.id != null ) {
				photovoltaicpowerstationload.reactive_power_c_point_id = photovoltaicpowerstationload.reactive_power_c_point.id;
			} else {
				photovoltaicpowerstationload.reactive_power_c_point_id = undefined;
			}
			if (photovoltaicpowerstationload.total_apparent_power_point != null && photovoltaicpowerstationload.total_apparent_power_point.id != null ) {
				photovoltaicpowerstationload.total_apparent_power_point_id = photovoltaicpowerstationload.total_apparent_power_point.id;
			} else {
				photovoltaicpowerstationload.total_apparent_power_point_id = undefined;
			}
			if (photovoltaicpowerstationload.apparent_power_a_point != null && photovoltaicpowerstationload.apparent_power_a_point.id != null ) {
				photovoltaicpowerstationload.apparent_power_a_point_id = photovoltaicpowerstationload.apparent_power_a_point.id;
			} else {
				photovoltaicpowerstationload.apparent_power_a_point_id = undefined;
			}
			if (photovoltaicpowerstationload.apparent_power_b_point != null && photovoltaicpowerstationload.apparent_power_b_point.id != null ) {
				photovoltaicpowerstationload.apparent_power_b_point_id = photovoltaicpowerstationload.apparent_power_b_point.id;
			} else {
				photovoltaicpowerstationload.apparent_power_b_point_id = undefined;
			}
			if (photovoltaicpowerstationload.apparent_power_c_point != null && photovoltaicpowerstationload.apparent_power_c_point.id != null ) {
				photovoltaicpowerstationload.apparent_power_c_point_id = photovoltaicpowerstationload.apparent_power_c_point.id;
			} else {
				photovoltaicpowerstationload.apparent_power_c_point_id = undefined;
			}
			if (photovoltaicpowerstationload.total_power_factor_point != null && photovoltaicpowerstationload.total_power_factor_point.id != null ) {
				photovoltaicpowerstationload.total_power_factor_point_id = photovoltaicpowerstationload.total_power_factor_point.id;
			} else {
				photovoltaicpowerstationload.total_power_factor_point_id = undefined;
			}
			if (photovoltaicpowerstationload.active_energy_import_point != null && photovoltaicpowerstationload.active_energy_import_point.id != null ) {
				photovoltaicpowerstationload.active_energy_import_point_id = photovoltaicpowerstationload.active_energy_import_point.id;
			} else {
				photovoltaicpowerstationload.active_energy_import_point_id = undefined;
			}
			if (photovoltaicpowerstationload.active_energy_export_point != null && photovoltaicpowerstationload.active_energy_export_point.id != null ) {
				photovoltaicpowerstationload.active_energy_export_point_id = photovoltaicpowerstationload.active_energy_export_point.id;
			} else {
				photovoltaicpowerstationload.active_energy_export_point_id = undefined;
			}
			if (photovoltaicpowerstationload.active_energy_net_point != null && photovoltaicpowerstationload.active_energy_net_point.id != null ) {
				photovoltaicpowerstationload.active_energy_net_point_id = photovoltaicpowerstationload.active_energy_net_point.id;
			} else {
				photovoltaicpowerstationload.active_energy_net_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			PhotovoltaicPowerStationLoadService.addPhotovoltaicPowerStationLoad($scope.currentPhotovoltaicPowerStation.id, photovoltaicpowerstationload, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getPhotovoltaicPowerStationLoadsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  					$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
                    $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
            		$scope.$emit('handleEmitPhotovoltaicPowerStationLoadChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.LOAD")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editPhotovoltaicPowerStationLoad = function(photovoltaicpowerstationload) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/photovoltaicpowerstation/photovoltaicpowerstationload.model.html',
  			controller: 'ModalEditPhotovoltaicPowerStationLoadCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						photovoltaicpowerstationload: angular.copy(photovoltaicpowerstationload),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedPhotovoltaicPowerStationLoad) {
			modifiedPhotovoltaicPowerStationLoad.power_point_id = modifiedPhotovoltaicPowerStationLoad.power_point.id;
			modifiedPhotovoltaicPowerStationLoad.meter_id = modifiedPhotovoltaicPowerStationLoad.meter.id;

			if (modifiedPhotovoltaicPowerStationLoad.active_power_a_point != null && modifiedPhotovoltaicPowerStationLoad.active_power_a_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.active_power_a_point_id = modifiedPhotovoltaicPowerStationLoad.active_power_a_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.active_power_a_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.active_power_b_point != null && modifiedPhotovoltaicPowerStationLoad.active_power_b_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.active_power_b_point_id = modifiedPhotovoltaicPowerStationLoad.active_power_b_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.active_power_b_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.active_power_c_point != null && modifiedPhotovoltaicPowerStationLoad.active_power_c_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.active_power_c_point_id = modifiedPhotovoltaicPowerStationLoad.active_power_c_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.active_power_c_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.total_reactive_power_point != null && modifiedPhotovoltaicPowerStationLoad.total_reactive_power_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.total_reactive_power_point_id = modifiedPhotovoltaicPowerStationLoad.total_reactive_power_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.total_reactive_power_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.reactive_power_a_point != null && modifiedPhotovoltaicPowerStationLoad.reactive_power_a_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.reactive_power_a_point_id = modifiedPhotovoltaicPowerStationLoad.reactive_power_a_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.reactive_power_a_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.reactive_power_b_point != null && modifiedPhotovoltaicPowerStationLoad.reactive_power_b_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.reactive_power_b_point_id = modifiedPhotovoltaicPowerStationLoad.reactive_power_b_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.reactive_power_b_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.reactive_power_c_point != null && modifiedPhotovoltaicPowerStationLoad.reactive_power_c_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.reactive_power_c_point_id = modifiedPhotovoltaicPowerStationLoad.reactive_power_c_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.reactive_power_c_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.total_apparent_power_point != null && modifiedPhotovoltaicPowerStationLoad.total_apparent_power_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.total_apparent_power_point_id = modifiedPhotovoltaicPowerStationLoad.total_apparent_power_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.total_apparent_power_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.apparent_power_a_point != null && modifiedPhotovoltaicPowerStationLoad.apparent_power_a_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.apparent_power_a_point_id = modifiedPhotovoltaicPowerStationLoad.apparent_power_a_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.apparent_power_a_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.apparent_power_b_point != null && modifiedPhotovoltaicPowerStationLoad.apparent_power_b_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.apparent_power_b_point_id = modifiedPhotovoltaicPowerStationLoad.apparent_power_b_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.apparent_power_b_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.apparent_power_c_point != null && modifiedPhotovoltaicPowerStationLoad.apparent_power_c_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.apparent_power_c_point_id = modifiedPhotovoltaicPowerStationLoad.apparent_power_c_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.apparent_power_c_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.total_power_factor_point != null && modifiedPhotovoltaicPowerStationLoad.total_power_factor_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.total_power_factor_point_id = modifiedPhotovoltaicPowerStationLoad.total_power_factor_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.total_power_factor_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.active_energy_import_point != null && modifiedPhotovoltaicPowerStationLoad.active_energy_import_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.active_energy_import_point_id = modifiedPhotovoltaicPowerStationLoad.active_energy_import_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.active_energy_import_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.active_energy_export_point != null && modifiedPhotovoltaicPowerStationLoad.active_energy_export_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.active_energy_export_point_id = modifiedPhotovoltaicPowerStationLoad.active_energy_export_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.active_energy_export_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationLoad.active_energy_net_point != null && modifiedPhotovoltaicPowerStationLoad.active_energy_net_point.id != null ) {
				modifiedPhotovoltaicPowerStationLoad.active_energy_net_point_id = modifiedPhotovoltaicPowerStationLoad.active_energy_net_point.id;
			} else {
				modifiedPhotovoltaicPowerStationLoad.active_energy_net_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			PhotovoltaicPowerStationLoadService.editPhotovoltaicPowerStationLoad($scope.currentPhotovoltaicPowerStation.id, modifiedPhotovoltaicPowerStationLoad, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getPhotovoltaicPowerStationLoadsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  					$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
                    $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
            		$scope.$emit('handleEmitPhotovoltaicPowerStationLoadChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.LOAD")}),
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

  	$scope.deletePhotovoltaicPowerStationLoad = function(photovoltaicpowerstationload) {
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
  					PhotovoltaicPowerStationLoadService.deletePhotovoltaicPowerStationLoad($scope.currentPhotovoltaicPowerStation.id, photovoltaicpowerstationload.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.LOAD")}),
								showCloseButton: true,
							});
							$scope.getPhotovoltaicPowerStationLoadsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
							$scope.$emit('handleEmitPhotovoltaicPowerStationLoadChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.LOAD")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

    $scope.bindPhotovoltaicPowerStationLoadPoint = function (load) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/photovoltaicpowerstation/photovoltaicpowerstationloadpoint.model.html",
        controller: "ModalBindPhotovoltaicPowerStationLoadCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              photovoltaicpowerstationid: $scope.currentPhotovoltaicPowerStation.id,
              photovoltaicpowerstationload: angular.copy(load),
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


  app.controller('ModalAddPhotovoltaicPowerStationLoadCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "PHOTOVOLTAIC_POWER_STATION.ADD_LOAD";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.photovoltaicpowerstationload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditPhotovoltaicPowerStationLoadCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "PHOTOVOLTAIC_POWER_STATION.EDIT_LOAD";
  	$scope.photovoltaicpowerstationload = params.photovoltaicpowerstationload;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.photovoltaicpowerstationload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

app.controller(
  "ModalBindPhotovoltaicPowerStationLoadCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    PhotovoltaicPowerStationLoadService,
    PointService,
    params
  ) {
    $scope.operation = "PHOTOVOLTAIC_POWER_STATION.EDIT_LOAD";
    $scope.photovoltaicpowerstationid = params.photovoltaicpowerstationid;
    $scope.photovoltaicpowerstationload = params.photovoltaicpowerstationload;
    $scope.datasources = params.datasources;
    $scope.boundpoints = [];

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    PhotovoltaicPowerStationLoadService.getPointsByLoadID(
      $scope.photovoltaicpowerstationid,
      $scope.photovoltaicpowerstationload.id,
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
      PhotovoltaicPowerStationLoadService.addPair(
        params.photovoltaicpowerstationid,
        params.photovoltaicpowerstationload.id,
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
            PhotovoltaicPowerStationLoadService.getPointsByLoadID(
              params.photovoltaicpowerstationid,
              params.photovoltaicpowerstationload.id,
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
      PhotovoltaicPowerStationLoadService.deletePair(
        params.photovoltaicpowerstationid,
        params.photovoltaicpowerstationload.id,
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
            PhotovoltaicPowerStationLoadService.getPointsByLoadID(
              params.photovoltaicpowerstationid,
              params.photovoltaicpowerstationload.id,
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
