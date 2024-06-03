'use strict';

app.controller('EnergyStoragePowerStationController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
    ContactService,
    EnergyStoragePowerStationService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

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

	$scope.getAllPhaseOfLifecycles = function() {
		$scope.phaseoflifecycles = [
			{"code":"1use", "name": $translate.instant("ENERGY_STORAGE_POWER_STATION.PHASE_1USE")},
			{"code":"2commissioning", "name": $translate.instant("ENERGY_STORAGE_POWER_STATION.PHASE_2COMMISSIONING")},
			{"code":"3installation", "name": $translate.instant("ENERGY_STORAGE_POWER_STATION.PHASE_3INSTALLATION")}
		];
	};

	$scope.addEnergyStoragePowerStation = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstation.model.html',
			controller: 'ModalAddEnergyStoragePowerStationCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
						phaseoflifecycles: angular.copy($scope.phaseoflifecycles)
					};
				}
			}
		});
		modalInstance.result.then(function(energystoragepowerstation) {
			energystoragepowerstation.cost_center_id = energystoragepowerstation.cost_center.id;
			energystoragepowerstation.contact_id = energystoragepowerstation.contact.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EnergyStoragePowerStationService.addEnergyStoragePowerStation(energystoragepowerstation, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitEnergyStoragePowerStationChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editEnergyStoragePowerStation = function(energystoragepowerstation) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/energystoragepowerstation/energystoragepowerstation.model.html',
			controller: 'ModalEditEnergyStoragePowerStationCtrl',
			resolve: {
				params: function() {
					return {
						energystoragepowerstation: angular.copy(energystoragepowerstation),
						costcenters:angular.copy($scope.costcenters),
						contacts:angular.copy($scope.contacts),
						phaseoflifecycles: angular.copy($scope.phaseoflifecycles)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedEnergyStoragePowerStation) {
			modifiedEnergyStoragePowerStation.cost_center_id=modifiedEnergyStoragePowerStation.cost_center.id;
			modifiedEnergyStoragePowerStation.contact_id=modifiedEnergyStoragePowerStation.contact.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EnergyStoragePowerStationService.editEnergyStoragePowerStation(modifiedEnergyStoragePowerStation, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitEnergyStoragePowerStationChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION")}),
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

	$scope.deleteEnergyStoragePowerStation=function(energystoragepowerstation){
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
		function (isConfirm) {
			if (isConfirm) {
				let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
				EnergyStoragePowerStationService.deleteEnergyStoragePowerStation(energystoragepowerstation, headers, function(response) {
					if (angular.isDefined(response.status) && response.status === 204) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION")}),
							showCloseButton: true,
						});
						$scope.$emit('handleEmitEnergyStoragePowerStationChanged');
					}else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION")}),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}
		});
	};

	$scope.exportEnergyStoragePowerStation = function(energystoragepowerstation) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyStoragePowerStationService.exportEnergyStoragePowerStation(energystoragepowerstation, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.exportdata = JSON.stringify(response.data);
				var modalInstance = $uibModal.open({
					windowClass: "animated fadeIn",
					templateUrl: 'views/common/export.html',
					controller: 'ModalExportCtrl',
					resolve: {
						params: function() {
							return {
								exportdata: angular.copy($scope.exportdata)
							};
						}
					}
				});
				modalInstance.result.then(function() {
					//do nothing;
				}, function() {
					//do nothing;
				});
				$rootScope.modalInstance = modalInstance;
			} else {
				$scope.exportdata = null;
			}
		});
	};

	$scope.cloneEnergyStoragePowerStation = function(energystoragepowerstation){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyStoragePowerStationService.cloneEnergyStoragePowerStation(energystoragepowerstation, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitEnergyStoragePowerStationChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importEnergyStoragePowerStation = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/common/import.html',
			controller: 'ModalImportCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
					};
				}
			}
		});
		modalInstance.result.then(function(importdata) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EnergyStoragePowerStationService.importEnergyStoragePowerStation(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitEnergyStoragePowerStationChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.ENERGY_STORAGE_POWER_STATION") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllEnergyStoragePowerStations();
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	$scope.getAllPhaseOfLifecycles();
	$scope.$on('handleBroadcastEnergyStoragePowerStationChanged', function(event) {
  		$scope.getAllEnergyStoragePowerStations();
	});
});

app.controller('ModalAddEnergyStoragePowerStationCtrl', function($scope, $uibModalInstance,params) {
	$scope.operation = "SETTING.ADD_ENERGY_STORAGE_POWER_STATION";
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.phaseoflifecycles=params.phaseoflifecycles;
	$scope.energystoragepowerstation = {
		is_cost_data_displayed: false
	};
	$scope.ok = function() {
		$uibModalInstance.close($scope.energystoragepowerstation);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditEnergyStoragePowerStationCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_ENERGY_STORAGE_POWER_STATION";
	$scope.energystoragepowerstation = params.energystoragepowerstation;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.phaseoflifecycles=params.phaseoflifecycles;
	$scope.ok = function() {
		$uibModalInstance.close($scope.energystoragepowerstation);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
