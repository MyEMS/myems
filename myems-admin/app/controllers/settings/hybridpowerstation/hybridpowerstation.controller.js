'use strict';

app.controller('HybridPowerStationController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
    ContactService,
    SVGService,
	PointService,
    HybridPowerStationService,
    toaster,
    SweetAlert) {
		$scope.svgs = [];
		$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
		$scope.getAllCostCenters = function() {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			CostCenterService.getAllCostCenters(headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.costcenters = response.data;
				} else {
					$scope.costcenters = [];
				}
			});
		};

	$scope.getAllContacts = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ContactService.getAllContacts(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
			} else {
				$scope.contacts = [];
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

	$scope.getAllSVGs = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token, "Quickmode": 'true'  };
		SVGService.getAllSVGs(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.svgs = response.data;
			} else {
				$scope.svgs = [];
			}
		});
	};

	$scope.getAllPhaseOfLifecycles = function() {
		$scope.phaseoflifecycles = [
			{"code":"1use", "name": $translate.instant("HYBRID_POWER_STATION.PHASE_1USE")},
			{"code":"2commissioning", "name": $translate.instant("HYBRID_POWER_STATION.PHASE_2COMMISSIONING")},
			{"code":"3installation", "name": $translate.instant("HYBRID_POWER_STATION.PHASE_3INSTALLATION")}
		];
	};

	$scope.getAllHybridPowerStations = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		HybridPowerStationService.getAllHybridPowerStations(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.hybridpowerstations = response.data;
			} else {
				$scope.hybridpowerstations = [];
			}
		});
	};

	$scope.addHybridPowerStation = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/hybridpowerstation/hybridpowerstation.model.html',
			controller: 'ModalAddHybridPowerStationCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
						svgs: angular.copy($scope.svgs),
						points: angular.copy($scope.points),
						phaseoflifecycles: angular.copy($scope.phaseoflifecycles)
					};
				}
			}
		});
		modalInstance.result.then(function(hybridpowerstation) {
			hybridpowerstation.cost_center_id = hybridpowerstation.cost_center.id;
			hybridpowerstation.contact_id = hybridpowerstation.contact.id;
			hybridpowerstation.svg_id = hybridpowerstation.svg.id;
			if (hybridpowerstation.svg2 != null && hybridpowerstation.svg2.id != null) {
				hybridpowerstation.svg2_id = hybridpowerstation.svg2.id;
			}
			if (hybridpowerstation.svg3 != null && hybridpowerstation.svg3.id != null) {
				hybridpowerstation.svg3_id = hybridpowerstation.svg3.id;
			}
			if (hybridpowerstation.svg4 != null && hybridpowerstation.svg4.id != null) {
				hybridpowerstation.svg4_id = hybridpowerstation.svg4.id;
			}
			if (hybridpowerstation.svg5 != null && hybridpowerstation.svg5.id != null) {
				hybridpowerstation.svg5_id = hybridpowerstation.svg5.id;
			}
			if (hybridpowerstation.longitude_point != null && hybridpowerstation.longitude_point.id != null ) {
				hybridpowerstation.longitude_point_id = hybridpowerstation.longitude_point.id;
			} else {
				hybridpowerstation.longitude_point_id = undefined;
			}
			if (hybridpowerstation.latitude_point != null && hybridpowerstation.latitude_point.id != null ) {
				hybridpowerstation.latitude_point_id = hybridpowerstation.latitude_point.id;
			} else {
				hybridpowerstation.latitude_point_id = undefined;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			HybridPowerStationService.addHybridPowerStation(hybridpowerstation, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.HYBRID_POWER_STATION")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitHybridPowerStationChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.HYBRID_POWER_STATION") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editHybridPowerStation = function(hybridpowerstation) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/hybridpowerstation/hybridpowerstation.model.html',
			controller: 'ModalEditHybridPowerStationCtrl',
			resolve: {
				params: function() {
					return {
						hybridpowerstation: angular.copy(hybridpowerstation),
						costcenters:angular.copy($scope.costcenters),
						contacts:angular.copy($scope.contacts),
						svgs:angular.copy($scope.svgs),
						points:angular.copy($scope.points),
						phaseoflifecycles: angular.copy($scope.phaseoflifecycles)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedHybridPowerStation) {
			modifiedHybridPowerStation.cost_center_id=modifiedHybridPowerStation.cost_center.id;
			modifiedHybridPowerStation.contact_id=modifiedHybridPowerStation.contact.id;
			modifiedHybridPowerStation.svg_id=modifiedHybridPowerStation.svg.id;
			if (modifiedHybridPowerStation.longitude_point != null && modifiedHybridPowerStation.longitude_point.id != null ) {
				modifiedHybridPowerStation.longitude_point_id = modifiedHybridPowerStation.longitude_point.id;
			} else {
				modifiedHybridPowerStation.longitude_point_id = undefined;
			}
			if (modifiedHybridPowerStation.latitude_point != null && modifiedHybridPowerStation.latitude_point.id != null ) {
				modifiedHybridPowerStation.latitude_point_id = modifiedHybridPowerStation.latitude_point.id;
			} else {
				modifiedHybridPowerStation.latitude_point_id = undefined;
			}
			if (modifiedHybridPowerStation.svg2 != null && modifiedHybridPowerStation.svg2.id != null) {
				modifiedHybridPowerStation.svg2_id = modifiedHybridPowerStation.svg2.id;
			}
			if (modifiedHybridPowerStation.svg3 != null && modifiedHybridPowerStation.svg3.id != null) {
				modifiedHybridPowerStation.svg3_id = modifiedHybridPowerStation.svg3.id;
			}
			if (modifiedHybridPowerStation.svg4 != null && modifiedHybridPowerStation.svg4.id != null) {
				modifiedHybridPowerStation.svg4_id = modifiedHybridPowerStation.svg4.id;
			}
			if (modifiedHybridPowerStation.svg5 != null && modifiedHybridPowerStation.svg5.id != null) {
				modifiedHybridPowerStation.svg5_id = modifiedHybridPowerStation.svg5.id;
			}

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			HybridPowerStationService.editHybridPowerStation(modifiedHybridPowerStation, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.HYBRID_POWER_STATION")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitHybridPowerStationChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.HYBRID_POWER_STATION")}),
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

	$scope.deleteHybridPowerStation=function(hybridpowerstation){
		SweetAlert.swal({
		        title: $translate.instant("SWEET.TITLE"),
		        text: $translate.instant("SWEET.TEXT"),
		        type: "warning",
		        showCancelButton: true,
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
		        cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
		        closeOnConfirm: true,
		        closeOnCancel: true },
		    function (isConfirm) {
		        if (isConfirm) {
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		            HybridPowerStationService.deleteHybridPowerStation(hybridpowerstation, headers, function(response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.HYBRID_POWER_STATION")}),
								showCloseButton: true,
							});
							$scope.$emit('handleEmitHybridPowerStationChanged');
						}else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.HYBRID_POWER_STATION")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    });
	};
	$scope.getAllHybridPowerStations();
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	$scope.getAllSVGs();
	$scope.getAllPoints();
	$scope.getAllPhaseOfLifecycles();
	$scope.$on('handleBroadcastHybridPowerStationChanged', function(event) {
  		$scope.getAllHybridPowerStations();
	});
});

app.controller('ModalAddHybridPowerStationCtrl', function($scope, $uibModalInstance,params) {

	$scope.operation = "SETTING.ADD_HYBRID_POWER_STATION";
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.svgs=params.svgs;
	$scope.points=params.points;
	$scope.phaseoflifecycles=params.phaseoflifecycles;
	$scope.ok = function() {
		$uibModalInstance.close($scope.hybridpowerstation);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditHybridPowerStationCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_HYBRID_POWER_STATION";
	$scope.hybridpowerstation = params.hybridpowerstation;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.svgs=params.svgs;
	$scope.points=params.points;
	$scope.phaseoflifecycles=params.phaseoflifecycles;
	$scope.ok = function() {
		$uibModalInstance.close($scope.hybridpowerstation);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
