'use strict';

app.controller('PhotovoltaicPowerStationController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    ContactService,
    CostCenterService,
    SVGService,
    PhotovoltaicPowerStationService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.getAllContacts = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token};
		ContactService.getAllContacts(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
			} else {
				$scope.contacts = [];
			}
		});
	};

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

        let searchDebounceTimer = null;
        $scope.searchPhotovoltaicPowerStations = function() {
                let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
                const rawKeyword = $scope.searchKeyword || "";
                const trimmedKeyword = rawKeyword.trim();
                if (searchDebounceTimer) {
                    clearTimeout(searchDebounceTimer);
                }               
                searchDebounceTimer = setTimeout(() => {
                    if (!trimmedKeyword) {
                        $scope.getAllPhotovoltaicPowerStations();
                        return;
                    }
                PhotovoltaicPowerStationService.searchPhotovoltaicPowerStations(trimmedKeyword, headers, function (response) {
                        if (angular.isDefined(response.status) && response.status === 200) {
                                $scope.photovoltaicpowerstations = response.data;
                        } else {
                                $scope.photovoltaicpowerstations = [];
                        }       
                });
                }, 300);
        };

	$scope.getAllPhaseOfLifecycles = function() {
		$scope.phaseoflifecycles = [
			{"code":"1use", "name": $translate.instant("PHOTOVOLTAIC_POWER_STATION.PHASE_1USE")},
			{"code":"2commissioning", "name": $translate.instant("PHOTOVOLTAIC_POWER_STATION.PHASE_2COMMISSIONING")},
			{"code":"3installation", "name": $translate.instant("PHOTOVOLTAIC_POWER_STATION.PHASE_3INSTALLATION")}
		];
	};
	$scope.addPhotovoltaicPowerStation = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/photovoltaicpowerstation/photovoltaicpowerstation.model.html',
			controller: 'ModalAddPhotovoltaicPowerStationCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
						svgs: angular.copy($scope.svgs),
						phaseoflifecycles: angular.copy($scope.phaseoflifecycles)
					};
				}
			}
		});
		modalInstance.result.then(function(photovoltaicpowerstation) {
			photovoltaicpowerstation.cost_center_id = photovoltaicpowerstation.cost_center.id;
			photovoltaicpowerstation.contact_id = photovoltaicpowerstation.contact.id;
			photovoltaicpowerstation.svg_id = photovoltaicpowerstation.svg.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			PhotovoltaicPowerStationService.addPhotovoltaicPowerStation(photovoltaicpowerstation, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitPhotovoltaicPowerStationChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editPhotovoltaicPowerStation = function(photovoltaicpowerstation) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/photovoltaicpowerstation/photovoltaicpowerstation.model.html',
			controller: 'ModalEditPhotovoltaicPowerStationCtrl',
			resolve: {
				params: function() {
					return {
						photovoltaicpowerstation: angular.copy(photovoltaicpowerstation),
						costcenters:angular.copy($scope.costcenters),
						contacts:angular.copy($scope.contacts),
						svgs:angular.copy($scope.svgs),
						phaseoflifecycles: angular.copy($scope.phaseoflifecycles)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedPhotovoltaicPowerStation) {
			modifiedPhotovoltaicPowerStation.cost_center_id=modifiedPhotovoltaicPowerStation.cost_center.id;
			modifiedPhotovoltaicPowerStation.contact_id=modifiedPhotovoltaicPowerStation.contact.id;
			modifiedPhotovoltaicPowerStation.svg_id = modifiedPhotovoltaicPowerStation.svg.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			PhotovoltaicPowerStationService.editPhotovoltaicPowerStation(modifiedPhotovoltaicPowerStation, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitPhotovoltaicPowerStationChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION")}),
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

	$scope.deletePhotovoltaicPowerStation=function(photovoltaicpowerstation){
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
	            PhotovoltaicPowerStationService.deletePhotovoltaicPowerStation(photovoltaicpowerstation, headers, function(response) {
          if (angular.isDefined(response.status) && response.status === 204) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION")}),
							showCloseButton: true,
						});
						$scope.$emit('handleEmitPhotovoltaicPowerStationChanged');
					}else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION")}),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
          }
        });
      }
    });
	};

	$scope.exportPhotovoltaicPowerStation = function(photovoltaicpowerstation) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		PhotovoltaicPowerStationService.exportPhotovoltaicPowerStation(photovoltaicpowerstation, headers, function(response) {
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

	$scope.clonePhotovoltaicPowerStation = function(photovoltaicpowerstation){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		PhotovoltaicPowerStationService.clonePhotovoltaicPowerStation(photovoltaicpowerstation, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitPhotovoltaicPowerStationChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importPhotovoltaicPowerStation = function() {
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
			PhotovoltaicPowerStationService.importPhotovoltaicPowerStation(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitPhotovoltaicPowerStationChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.PHOTOVOLTAIC_POWER_STATION") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllPhotovoltaicPowerStations();
	$scope.getAllContacts();
	$scope.getAllCostCenters();
	$scope.getAllSVGs();
	$scope.getAllPhaseOfLifecycles();
	$scope.$on('handleBroadcastPhotovoltaicPowerStationChanged', function(event) {
  		$scope.getAllPhotovoltaicPowerStations();
	});
});

app.controller('ModalAddPhotovoltaicPowerStationCtrl', function($scope, $uibModalInstance,params) {
	$scope.operation = "SETTING.ADD_PHOTOVOLTAIC_POWER_STATION";
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.svgs=params.svgs;
	$scope.phaseoflifecycles=params.phaseoflifecycles;
	$scope.photovoltaicpowerstation = {
		is_cost_data_displayed: false
	};
	$scope.ok = function() {
		$uibModalInstance.close($scope.photovoltaicpowerstation);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditPhotovoltaicPowerStationCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_PHOTOVOLTAIC_POWER_STATION";
	$scope.photovoltaicpowerstation = params.photovoltaicpowerstation;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.svgs=params.svgs;
	$scope.phaseoflifecycles=params.phaseoflifecycles;
	$scope.ok = function() {
		$uibModalInstance.close($scope.photovoltaicpowerstation);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
