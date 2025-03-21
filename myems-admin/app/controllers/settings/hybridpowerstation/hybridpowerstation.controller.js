'use strict';

app.controller('HybridPowerStationController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
    ContactService,
    HybridPowerStationService,
    toaster,
    SweetAlert) {
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
					};
				}
			}
		});
		modalInstance.result.then(function(hybridpowerstation) {
			hybridpowerstation.cost_center_id = hybridpowerstation.cost_center.id;
			hybridpowerstation.contact_id = hybridpowerstation.contact.id;

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
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedHybridPowerStation) {
			modifiedHybridPowerStation.cost_center_id=modifiedHybridPowerStation.cost_center.id;
			modifiedHybridPowerStation.contact_id=modifiedHybridPowerStation.contact.id;

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
	$scope.$on('handleBroadcastHybridPowerStationChanged', function(event) {
  		$scope.getAllHybridPowerStations();
	});
});

app.controller('ModalAddHybridPowerStationCtrl', function($scope, $uibModalInstance,params) {

	$scope.operation = "SETTING.ADD_HYBRID_POWER_STATION";
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
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
	$scope.ok = function() {
		$uibModalInstance.close($scope.hybridpowerstation);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
