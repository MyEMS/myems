'use strict';

app.controller('PhotovoltaicPowerStationInvertorController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	PhotovoltaicPowerStationService,
	PhotovoltaicPowerStationInvertorService,
	PhotovoltaicPowerStationDataSourceService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.photovoltaicpowerstations = [];
      $scope.photovoltaicpowerstationinvertors = [];
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

  	$scope.getPhotovoltaicPowerStationInvertorsByPhotovoltaicPowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		PhotovoltaicPowerStationInvertorService.getPhotovoltaicPowerStationInvertorsByPhotovoltaicPowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.photovoltaicpowerstationinvertors = response.data;
			} else {
          		$scope.photovoltaicpowerstationinvertors=[];
        	}
		});
  	};

  	$scope.changePhotovoltaicPowerStation=function(item,model){
    	$scope.currentPhotovoltaicPowerStation=item;
    	$scope.currentPhotovoltaicPowerStation.selected=model;
        $scope.is_show_add_photovoltaic_power_station_invertor = true;
    	$scope.getPhotovoltaicPowerStationInvertorsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
    	$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
        $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  	};

  	$scope.addPhotovoltaicPowerStationInvertor = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/photovoltaicpowerstation/photovoltaicpowerstationinvertor.model.html',
  			controller: 'ModalAddPhotovoltaicPowerStationInvertorCtrl',
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
  		modalInstance.result.then(function(photovoltaicpowerstationinvertor) {
			photovoltaicpowerstationinvertor.invertor_state_point_id = photovoltaicpowerstationinvertor.invertor_state_point.id;
			photovoltaicpowerstationinvertor.communication_state_point_id = photovoltaicpowerstationinvertor.communication_state_point.id;
			photovoltaicpowerstationinvertor.total_energy_point_id = photovoltaicpowerstationinvertor.total_energy_point.id;
			photovoltaicpowerstationinvertor.generation_meter_id = photovoltaicpowerstationinvertor.generation_meter.id;
			if (photovoltaicpowerstationinvertor.today_charge_energy_point != null && photovoltaicpowerstationinvertor.today_charge_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.today_charge_energy_point_id = photovoltaicpowerstationinvertor.today_charge_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.today_charge_energy_point_id = undefined;
			}			if (photovoltaicpowerstationinvertor.total_energy_point != null && photovoltaicpowerstationinvertor.total_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.total_energy_point_id = photovoltaicpowerstationinvertor.total_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.total_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.today_energy_point != null && photovoltaicpowerstationinvertor.today_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.today_energy_point_id = photovoltaicpowerstationinvertor.today_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.today_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.efficiency_point != null && photovoltaicpowerstationinvertor.efficiency_point.id != null ) {
				photovoltaicpowerstationinvertor.efficiency_point_id = photovoltaicpowerstationinvertor.efficiency_point.id;
			} else {
				photovoltaicpowerstationinvertor.efficiency_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.temperature_point != null && photovoltaicpowerstationinvertor.temperature_point.id != null ) {
				photovoltaicpowerstationinvertor.temperature_point_id = photovoltaicpowerstationinvertor.temperature_point.id;
			} else {
				photovoltaicpowerstationinvertor.temperature_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.power_factor_point != null && photovoltaicpowerstationinvertor.power_factor_point.id != null ) {
				photovoltaicpowerstationinvertor.power_factor_point_id = photovoltaicpowerstationinvertor.power_factor_point.id;
			} else {
				photovoltaicpowerstationinvertor.power_factor_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.active_power_point != null && photovoltaicpowerstationinvertor.active_power_point.id != null ) {
				photovoltaicpowerstationinvertor.active_power_point_id = photovoltaicpowerstationinvertor.active_power_point.id;
			} else {
				photovoltaicpowerstationinvertor.active_power_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.reactive_power_point != null && photovoltaicpowerstationinvertor.reactive_power_point.id != null ) {
				photovoltaicpowerstationinvertor.reactive_power_point_id = photovoltaicpowerstationinvertor.reactive_power_point.id;
			} else {
				photovoltaicpowerstationinvertor.reactive_power_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.frequency_point != null && photovoltaicpowerstationinvertor.frequency_point.id != null ) {
				photovoltaicpowerstationinvertor.frequency_point_id = photovoltaicpowerstationinvertor.frequency_point.id;
			} else {
				photovoltaicpowerstationinvertor.frequency_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.uab_point != null && photovoltaicpowerstationinvertor.uab_point.id != null ) {
				photovoltaicpowerstationinvertor.uab_point_id = photovoltaicpowerstationinvertor.uab_point.id;
			} else {
				photovoltaicpowerstationinvertor.uab_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.ubc_point != null && photovoltaicpowerstationinvertor.ubc_point.id != null ) {
				photovoltaicpowerstationinvertor.ubc_point_id = photovoltaicpowerstationinvertor.ubc_point.id;
			} else {
				photovoltaicpowerstationinvertor.ubc_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.uca_point != null && photovoltaicpowerstationinvertor.uca_point.id != null ) {
				photovoltaicpowerstationinvertor.uca_point_id = photovoltaicpowerstationinvertor.uca_point.id;
			} else {
				photovoltaicpowerstationinvertor.uca_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.ua_point != null && photovoltaicpowerstationinvertor.ua_point.id != null ) {
				photovoltaicpowerstationinvertor.ua_point_id = photovoltaicpowerstationinvertor.ua_point.id;
			} else {
				photovoltaicpowerstationinvertor.ua_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.ub_point != null && photovoltaicpowerstationinvertor.ub_point.id != null ) {
				photovoltaicpowerstationinvertor.ub_point_id = photovoltaicpowerstationinvertor.ub_point.id;
			} else {
				photovoltaicpowerstationinvertor.ub_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.uc_point != null && photovoltaicpowerstationinvertor.uc_point.id != null ) {
				photovoltaicpowerstationinvertor.uc_point_id = photovoltaicpowerstationinvertor.uc_point.id;
			} else {
				photovoltaicpowerstationinvertor.uc_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.ia_point != null && photovoltaicpowerstationinvertor.ia_point.id != null ) {
				photovoltaicpowerstationinvertor.ia_point_id = photovoltaicpowerstationinvertor.ia_point.id;
			} else {
				photovoltaicpowerstationinvertor.ia_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.ib_point != null && photovoltaicpowerstationinvertor.ib_point.id != null ) {
				photovoltaicpowerstationinvertor.ib_point_id = photovoltaicpowerstationinvertor.ib_point.id;
			} else {
				photovoltaicpowerstationinvertor.ib_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.ic_point != null && photovoltaicpowerstationinvertor.ic_point.id != null ) {
				photovoltaicpowerstationinvertor.ic_point_id = photovoltaicpowerstationinvertor.ic_point.id;
			} else {
				photovoltaicpowerstationinvertor.ic_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv1_u_point != null && photovoltaicpowerstationinvertor.pv1_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv1_u_point_id = photovoltaicpowerstationinvertor.pv1_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv1_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv1_i_point != null && photovoltaicpowerstationinvertor.pv1_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv1_i_point_id = photovoltaicpowerstationinvertor.pv1_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv1_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv2_u_point != null && photovoltaicpowerstationinvertor.pv2_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv2_u_point_id = photovoltaicpowerstationinvertor.pv2_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv2_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv2_i_point != null && photovoltaicpowerstationinvertor.pv2_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv2_i_point_id = photovoltaicpowerstationinvertor.pv2_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv2_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv3_u_point != null && photovoltaicpowerstationinvertor.pv3_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv3_u_point_id = photovoltaicpowerstationinvertor.pv3_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv3_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv3_i_point != null && photovoltaicpowerstationinvertor.pv3_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv3_i_point_id = photovoltaicpowerstationinvertor.pv3_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv3_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv4_u_point != null && photovoltaicpowerstationinvertor.pv4_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv4_u_point_id = photovoltaicpowerstationinvertor.pv4_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv4_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv4_i_point != null && photovoltaicpowerstationinvertor.pv4_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv4_i_point_id = photovoltaicpowerstationinvertor.pv4_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv4_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv5_u_point != null && photovoltaicpowerstationinvertor.pv5_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv5_u_point_id = photovoltaicpowerstationinvertor.pv5_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv5_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv5_i_point != null && photovoltaicpowerstationinvertor.pv5_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv5_i_point_id = photovoltaicpowerstationinvertor.pv5_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv5_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv6_u_point != null && photovoltaicpowerstationinvertor.pv6_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv6_u_point_id = photovoltaicpowerstationinvertor.pv6_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv6_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv6_i_point != null && photovoltaicpowerstationinvertor.pv6_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv6_i_point_id = photovoltaicpowerstationinvertor.pv6_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv6_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv7_u_point != null && photovoltaicpowerstationinvertor.pv7_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv7_u_point_id = photovoltaicpowerstationinvertor.pv7_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv7_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv7_i_point != null && photovoltaicpowerstationinvertor.pv7_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv7_i_point_id = photovoltaicpowerstationinvertor.pv7_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv7_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv8_u_point != null && photovoltaicpowerstationinvertor.pv8_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv8_u_point_id = photovoltaicpowerstationinvertor.pv8_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv8_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv8_i_point != null && photovoltaicpowerstationinvertor.pv8_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv8_i_point_id = photovoltaicpowerstationinvertor.pv8_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv8_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv9_u_point != null && photovoltaicpowerstationinvertor.pv9_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv9_u_point_id = photovoltaicpowerstationinvertor.pv9_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv9_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv9_i_point != null && photovoltaicpowerstationinvertor.pv9_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv9_i_point_id = photovoltaicpowerstationinvertor.pv9_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv9_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv10_u_point != null && photovoltaicpowerstationinvertor.pv10_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv10_u_point_id = photovoltaicpowerstationinvertor.pv10_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv10_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv10_i_point != null && photovoltaicpowerstationinvertor.pv10_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv10_i_point_id = photovoltaicpowerstationinvertor.pv10_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv10_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv11_u_point != null && photovoltaicpowerstationinvertor.pv11_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv11_u_point_id = photovoltaicpowerstationinvertor.pv11_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv11_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv11_i_point != null && photovoltaicpowerstationinvertor.pv11_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv11_i_point_id = photovoltaicpowerstationinvertor.pv11_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv11_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv12_u_point != null && photovoltaicpowerstationinvertor.pv12_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv12_u_point_id = photovoltaicpowerstationinvertor.pv12_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv12_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv12_i_point != null && photovoltaicpowerstationinvertor.pv12_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv12_i_point_id = photovoltaicpowerstationinvertor.pv12_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv12_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv13_u_point != null && photovoltaicpowerstationinvertor.pv13_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv13_u_point_id = photovoltaicpowerstationinvertor.pv13_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv13_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv13_i_point != null && photovoltaicpowerstationinvertor.pv13_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv13_i_point_id = photovoltaicpowerstationinvertor.pv13_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv13_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv14_u_point != null && photovoltaicpowerstationinvertor.pv14_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv14_u_point_id = photovoltaicpowerstationinvertor.pv14_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv14_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv14_i_point != null && photovoltaicpowerstationinvertor.pv14_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv14_i_point_id = photovoltaicpowerstationinvertor.pv14_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv14_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv15_u_point != null && photovoltaicpowerstationinvertor.pv15_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv15_u_point_id = photovoltaicpowerstationinvertor.pv15_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv15_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv15_i_point != null && photovoltaicpowerstationinvertor.pv15_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv15_i_point_id = photovoltaicpowerstationinvertor.pv15_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv15_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv16_u_point != null && photovoltaicpowerstationinvertor.pv16_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv16_u_point_id = photovoltaicpowerstationinvertor.pv16_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv16_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv16_i_point != null && photovoltaicpowerstationinvertor.pv16_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv16_i_point_id = photovoltaicpowerstationinvertor.pv16_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv16_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv17_u_point != null && photovoltaicpowerstationinvertor.pv17_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv17_u_point_id = photovoltaicpowerstationinvertor.pv17_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv17_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv17_i_point != null && photovoltaicpowerstationinvertor.pv17_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv17_i_point_id = photovoltaicpowerstationinvertor.pv17_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv17_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv18_u_point != null && photovoltaicpowerstationinvertor.pv18_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv18_u_point_id = photovoltaicpowerstationinvertor.pv18_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv18_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv18_i_point != null && photovoltaicpowerstationinvertor.pv18_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv18_i_point_id = photovoltaicpowerstationinvertor.pv18_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv18_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv19_u_point != null && photovoltaicpowerstationinvertor.pv19_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv19_u_point_id = photovoltaicpowerstationinvertor.pv19_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv19_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv19_i_point != null && photovoltaicpowerstationinvertor.pv19_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv19_i_point_id = photovoltaicpowerstationinvertor.pv19_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv19_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv20_u_point != null && photovoltaicpowerstationinvertor.pv20_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv20_u_point_id = photovoltaicpowerstationinvertor.pv20_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv20_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv20_i_point != null && photovoltaicpowerstationinvertor.pv20_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv20_i_point_id = photovoltaicpowerstationinvertor.pv20_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv20_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv21_u_point != null && photovoltaicpowerstationinvertor.pv21_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv21_u_point_id = photovoltaicpowerstationinvertor.pv21_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv21_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv21_i_point != null && photovoltaicpowerstationinvertor.pv21_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv21_i_point_id = photovoltaicpowerstationinvertor.pv21_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv21_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv22_u_point != null && photovoltaicpowerstationinvertor.pv22_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv22_u_point_id = photovoltaicpowerstationinvertor.pv22_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv22_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv22_i_point != null && photovoltaicpowerstationinvertor.pv22_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv22_i_point_id = photovoltaicpowerstationinvertor.pv22_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv22_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv23_u_point != null && photovoltaicpowerstationinvertor.pv23_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv23_u_point_id = photovoltaicpowerstationinvertor.pv23_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv23_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv23_i_point != null && photovoltaicpowerstationinvertor.pv23_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv23_i_point_id = photovoltaicpowerstationinvertor.pv23_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv23_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv24_u_point != null && photovoltaicpowerstationinvertor.pv24_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv24_u_point_id = photovoltaicpowerstationinvertor.pv24_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv24_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv24_i_point != null && photovoltaicpowerstationinvertor.pv24_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv24_i_point_id = photovoltaicpowerstationinvertor.pv24_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv24_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv25_u_point != null && photovoltaicpowerstationinvertor.pv25_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv25_u_point_id = photovoltaicpowerstationinvertor.pv25_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv25_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv25_i_point != null && photovoltaicpowerstationinvertor.pv25_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv25_i_point_id = photovoltaicpowerstationinvertor.pv25_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv25_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv26_u_point != null && photovoltaicpowerstationinvertor.pv26_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv26_u_point_id = photovoltaicpowerstationinvertor.pv26_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv26_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv26_i_point != null && photovoltaicpowerstationinvertor.pv26_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv26_i_point_id = photovoltaicpowerstationinvertor.pv26_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv26_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv27_u_point != null && photovoltaicpowerstationinvertor.pv27_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv27_u_point_id = photovoltaicpowerstationinvertor.pv27_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv27_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv27_i_point != null && photovoltaicpowerstationinvertor.pv27_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv27_i_point_id = photovoltaicpowerstationinvertor.pv27_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv27_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv28_u_point != null && photovoltaicpowerstationinvertor.pv28_u_point.id != null ) {
				photovoltaicpowerstationinvertor.pv28_u_point_id = photovoltaicpowerstationinvertor.pv28_u_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv28_u_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.pv28_i_point != null && photovoltaicpowerstationinvertor.pv28_i_point.id != null ) {
				photovoltaicpowerstationinvertor.pv28_i_point_id = photovoltaicpowerstationinvertor.pv28_i_point.id;
			} else {
				photovoltaicpowerstationinvertor.pv28_i_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_total_energy_point != null && photovoltaicpowerstationinvertor.mppt_total_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_total_energy_point_id = photovoltaicpowerstationinvertor.mppt_total_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_total_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_power_point != null && photovoltaicpowerstationinvertor.mppt_power_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_power_point_id = photovoltaicpowerstationinvertor.mppt_power_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_power_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_1_energy_point != null && photovoltaicpowerstationinvertor.mppt_1_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_1_energy_point_id = photovoltaicpowerstationinvertor.mppt_1_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_1_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_2_energy_point != null && photovoltaicpowerstationinvertor.mppt_2_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_2_energy_point_id = photovoltaicpowerstationinvertor.mppt_2_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_2_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_3_energy_point != null && photovoltaicpowerstationinvertor.mppt_3_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_3_energy_point_id = photovoltaicpowerstationinvertor.mppt_3_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_3_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_4_energy_point != null && photovoltaicpowerstationinvertor.mppt_4_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_4_energy_point_id = photovoltaicpowerstationinvertor.mppt_4_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_4_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_5_energy_point != null && photovoltaicpowerstationinvertor.mppt_5_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_5_energy_point_id = photovoltaicpowerstationinvertor.mppt_5_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_5_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_6_energy_point != null && photovoltaicpowerstationinvertor.mppt_6_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_6_energy_point_id = photovoltaicpowerstationinvertor.mppt_6_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_6_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_7_energy_point != null && photovoltaicpowerstationinvertor.mppt_7_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_7_energy_point_id = photovoltaicpowerstationinvertor.mppt_7_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_7_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_8_energy_point != null && photovoltaicpowerstationinvertor.mppt_8_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_8_energy_point_id = photovoltaicpowerstationinvertor.mppt_8_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_8_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_9_energy_point != null && photovoltaicpowerstationinvertor.mppt_9_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_9_energy_point_id = photovoltaicpowerstationinvertor.mppt_9_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_9_energy_point_id = undefined;
			}
			if (photovoltaicpowerstationinvertor.mppt_10_energy_point != null && photovoltaicpowerstationinvertor.mppt_10_energy_point.id != null ) {
				photovoltaicpowerstationinvertor.mppt_10_energy_point_id = photovoltaicpowerstationinvertor.mppt_10_energy_point.id;
			} else {
				photovoltaicpowerstationinvertor.mppt_10_energy_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			PhotovoltaicPowerStationInvertorService.addPhotovoltaicPowerStationInvertor($scope.currentPhotovoltaicPowerStation.id, photovoltaicpowerstationinvertor, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.INVERTOR")}),
  						showCloseButton: true,
  					});
  					$scope.getPhotovoltaicPowerStationInvertorsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  					$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
                    $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
            		$scope.$emit('handleEmitPhotovoltaicPowerStationInvertorChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.INVERTOR")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editPhotovoltaicPowerStationInvertor = function(photovoltaicpowerstationinvertor) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/photovoltaicpowerstation/photovoltaicpowerstationinvertor.model.html',
  			controller: 'ModalEditPhotovoltaicPowerStationInvertorCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						photovoltaicpowerstationinvertor: angular.copy(photovoltaicpowerstationinvertor),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedPhotovoltaicPowerStationInvertor) {
			modifiedPhotovoltaicPowerStationInvertor.invertor_state_point_id = modifiedPhotovoltaicPowerStationInvertor.invertor_state_point.id;
			modifiedPhotovoltaicPowerStationInvertor.communication_state_point_id = modifiedPhotovoltaicPowerStationInvertor.communication_state_point.id;
			modifiedPhotovoltaicPowerStationInvertor.total_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.total_energy_point.id;
			modifiedPhotovoltaicPowerStationInvertor.generation_meter_id = modifiedPhotovoltaicPowerStationInvertor.generation_meter.id;
			if (modifiedPhotovoltaicPowerStationInvertor.total_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.total_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.total_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.total_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.total_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.today_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.today_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.today_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.today_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.today_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.efficiency_point != null && modifiedPhotovoltaicPowerStationInvertor.efficiency_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.efficiency_point_id = modifiedPhotovoltaicPowerStationInvertor.efficiency_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.efficiency_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.temperature_point != null && modifiedPhotovoltaicPowerStationInvertor.temperature_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.temperature_point_id = modifiedPhotovoltaicPowerStationInvertor.temperature_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.temperature_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.power_factor_point != null && modifiedPhotovoltaicPowerStationInvertor.power_factor_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.power_factor_point_id = modifiedPhotovoltaicPowerStationInvertor.power_factor_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.power_factor_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.active_power_point != null && modifiedPhotovoltaicPowerStationInvertor.active_power_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.active_power_point_id = modifiedPhotovoltaicPowerStationInvertor.active_power_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.active_power_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.reactive_power_point != null && modifiedPhotovoltaicPowerStationInvertor.reactive_power_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.reactive_power_point_id = modifiedPhotovoltaicPowerStationInvertor.reactive_power_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.reactive_power_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.frequency_point != null && modifiedPhotovoltaicPowerStationInvertor.frequency_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.frequency_point_id = modifiedPhotovoltaicPowerStationInvertor.frequency_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.frequency_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.uab_point != null && modifiedPhotovoltaicPowerStationInvertor.uab_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.uab_point_id = modifiedPhotovoltaicPowerStationInvertor.uab_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.uab_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.ubc_point != null && modifiedPhotovoltaicPowerStationInvertor.ubc_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.ubc_point_id = modifiedPhotovoltaicPowerStationInvertor.ubc_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.ubc_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.uca_point != null && modifiedPhotovoltaicPowerStationInvertor.uca_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.uca_point_id = modifiedPhotovoltaicPowerStationInvertor.uca_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.uca_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.ua_point != null && modifiedPhotovoltaicPowerStationInvertor.ua_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.ua_point_id = modifiedPhotovoltaicPowerStationInvertor.ua_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.ua_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.ub_point != null && modifiedPhotovoltaicPowerStationInvertor.ub_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.ub_point_id = modifiedPhotovoltaicPowerStationInvertor.ub_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.ub_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.uc_point != null && modifiedPhotovoltaicPowerStationInvertor.uc_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.uc_point_id = modifiedPhotovoltaicPowerStationInvertor.uc_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.uc_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.ia_point != null && modifiedPhotovoltaicPowerStationInvertor.ia_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.ia_point_id = modifiedPhotovoltaicPowerStationInvertor.ia_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.ia_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.ib_point != null && modifiedPhotovoltaicPowerStationInvertor.ib_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.ib_point_id = modifiedPhotovoltaicPowerStationInvertor.ib_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.ib_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.ic_point != null && modifiedPhotovoltaicPowerStationInvertor.ic_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.ic_point_id = modifiedPhotovoltaicPowerStationInvertor.ic_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.ic_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv1_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv1_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv1_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv1_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv1_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv1_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv1_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv1_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv1_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv1_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv2_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv2_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv2_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv2_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv2_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv2_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv2_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv2_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv2_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv2_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv3_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv3_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv3_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv3_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv3_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv3_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv3_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv3_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv3_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv3_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv4_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv4_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv4_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv4_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv4_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv4_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv4_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv4_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv4_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv4_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv5_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv5_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv5_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv5_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv5_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv5_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv5_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv5_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv5_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv5_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv6_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv6_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv6_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv6_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv6_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv6_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv6_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv6_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv6_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv6_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv7_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv7_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv7_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv7_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv7_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv7_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv7_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv7_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv7_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv7_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv8_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv8_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv8_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv8_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv8_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv8_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv8_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv8_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv8_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv8_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv9_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv9_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv9_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv9_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv9_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv9_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv9_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv9_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv9_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv9_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv10_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv10_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv10_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv10_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv10_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv10_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv10_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv10_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv10_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv10_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv11_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv11_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv11_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv11_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv11_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv11_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv11_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv11_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv11_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv11_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv12_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv12_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv12_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv12_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv12_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv12_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv12_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv12_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv12_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv12_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv13_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv13_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv13_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv13_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv13_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv13_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv13_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv13_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv13_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv13_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv14_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv14_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv14_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv14_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv14_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv14_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv14_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv14_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv14_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv14_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv15_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv15_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv15_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv15_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv15_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv15_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv15_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv15_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv15_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv15_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv16_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv16_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv16_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv16_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv16_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv16_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv16_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv16_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv16_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv16_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv17_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv17_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv17_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv17_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv17_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv17_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv17_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv17_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv17_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv17_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv18_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv18_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv18_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv18_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv18_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv18_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv18_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv18_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv18_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv18_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv19_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv19_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv19_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv19_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv19_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv19_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv19_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv19_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv19_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv19_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv20_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv20_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv20_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv20_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv20_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv20_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv20_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv20_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv20_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv20_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv21_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv21_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv21_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv21_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv21_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv21_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv21_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv21_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv21_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv21_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv22_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv22_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv22_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv22_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv22_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv22_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv22_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv22_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv22_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv22_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv23_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv23_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv23_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv23_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv23_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv23_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv23_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv23_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv23_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv23_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv24_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv24_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv24_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv24_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv24_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv24_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv24_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv24_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv24_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv24_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv25_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv25_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv25_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv25_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv25_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv25_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv25_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv25_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv25_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv25_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv26_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv26_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv26_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv26_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv26_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv26_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv26_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv26_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv26_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv26_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv27_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv27_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv27_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv27_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv27_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv27_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv27_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv27_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv27_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv27_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv28_u_point != null && modifiedPhotovoltaicPowerStationInvertor.pv28_u_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv28_u_point_id = modifiedPhotovoltaicPowerStationInvertor.pv28_u_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv28_u_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.pv28_i_point != null && modifiedPhotovoltaicPowerStationInvertor.pv28_i_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.pv28_i_point_id = modifiedPhotovoltaicPowerStationInvertor.pv28_i_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.pv28_i_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_total_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_total_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_total_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_total_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_total_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_power_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_power_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_power_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_power_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_power_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_1_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_1_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_1_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_1_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_1_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_2_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_2_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_2_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_2_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_2_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_3_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_3_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_3_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_3_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_3_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_4_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_4_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_4_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_4_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_4_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_5_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_5_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_5_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_5_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_5_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_6_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_6_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_6_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_6_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_6_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_7_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_7_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_7_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_7_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_7_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_8_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_8_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_8_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_8_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_8_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_9_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_9_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_9_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_9_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_9_energy_point_id = undefined;
			}
			if (modifiedPhotovoltaicPowerStationInvertor.mppt_10_energy_point != null && modifiedPhotovoltaicPowerStationInvertor.mppt_10_energy_point.id != null ) {
				modifiedPhotovoltaicPowerStationInvertor.mppt_10_energy_point_id = modifiedPhotovoltaicPowerStationInvertor.mppt_10_energy_point.id;
			} else {
				modifiedPhotovoltaicPowerStationInvertor.mppt_10_energy_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			PhotovoltaicPowerStationInvertorService.editPhotovoltaicPowerStationInvertor($scope.currentPhotovoltaicPowerStation.id, modifiedPhotovoltaicPowerStationInvertor, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.INVERTOR")}),
  						showCloseButton: true,
  					});
  					$scope.getPhotovoltaicPowerStationInvertorsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
  					$scope.getDataSourcesByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
                    $scope.getDataSourcePointsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
            		$scope.$emit('handleEmitPhotovoltaicPowerStationInvertorChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.INVERTOR")}),
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

  	$scope.deletePhotovoltaicPowerStationInvertor = function(photovoltaicpowerstationinvertor) {
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
  					PhotovoltaicPowerStationInvertorService.deletePhotovoltaicPowerStationInvertor($scope.currentPhotovoltaicPowerStation.id, photovoltaicpowerstationinvertor.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.INVERTOR")}),
								showCloseButton: true,
							});
							$scope.getPhotovoltaicPowerStationInvertorsByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
							$scope.$emit('handleEmitPhotovoltaicPowerStationInvertorChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("PHOTOVOLTAIC_POWER_STATION.INVERTOR")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

    $scope.bindPhotovoltaicPowerStationInvertorPoint = function (invertor) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/photovoltaicpowerstation/photovoltaicpowerstationinvertorpoint.model.html",
        controller: "ModalBindPhotovoltaicPowerStationInvertorCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              photovoltaicpowerstationid: $scope.currentPhotovoltaicPowerStation.id,
              photovoltaicpowerstationinvertor: angular.copy(invertor),
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


  app.controller('ModalAddPhotovoltaicPowerStationInvertorCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "PHOTOVOLTAIC_POWER_STATION.ADD_INVERTOR";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.photovoltaicpowerstationinvertor);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditPhotovoltaicPowerStationInvertorCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "PHOTOVOLTAIC_POWER_STATION.EDIT_INVERTOR";
  	$scope.photovoltaicpowerstationinvertor = params.photovoltaicpowerstationinvertor;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.photovoltaicpowerstationinvertor);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

app.controller(
  "ModalBindPhotovoltaicPowerStationInvertorCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    PhotovoltaicPowerStationInvertorService,
    PointService,
    params
  ) {
    $scope.operation = "PHOTOVOLTAIC_POWER_STATION.EDIT_INVERTOR";
    $scope.photovoltaicpowerstationid = params.photovoltaicpowerstationid;
    $scope.photovoltaicpowerstationinvertor = params.photovoltaicpowerstationinvertor;
    $scope.datasources = params.datasources;
    $scope.boundpoints = params.boundpoints;

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    PhotovoltaicPowerStationInvertorService.getPointsByInvertorID(
      $scope.photovoltaicpowerstationid,
      $scope.photovoltaicpowerstationinvertor.id,
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
      PhotovoltaicPowerStationInvertorService.addPair(
        params.photovoltaicpowerstationid,
        params.photovoltaicpowerstationinvertor.id,
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
            PhotovoltaicPowerStationInvertorService.getPointsByInvertorID(
              params.photovoltaicpowerstationid,
              params.photovoltaicpowerstationinvertor.id,
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
      PhotovoltaicPowerStationInvertorService.deletePair(
        params.photovoltaicpowerstationid,
        params.photovoltaicpowerstationinvertor.id,
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
            PhotovoltaicPowerStationInvertorService.getPointsByInvertorID(
              params.photovoltaicpowerstationid,
              params.photovoltaicpowerstationinvertor.id,
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