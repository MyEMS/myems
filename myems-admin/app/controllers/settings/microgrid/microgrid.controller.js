'use strict';

app.controller('MicrogridController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
    ContactService,
    SVGService,
    MicrogridService,
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
			{"code":"1use", "name": $translate.instant("MICROGRID.PHASE_1USE")},
			{"code":"2commissioning", "name": $translate.instant("MICROGRID.PHASE_2COMMISSIONING")},
			{"code":"3installation", "name": $translate.instant("MICROGRID.PHASE_3INSTALLATION")}
		];
	};
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

        let searchDebounceTimer = null;
        $scope.searchMicrogrids = function() {
                let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
                const rawKeyword = $scope.searchKeyword || "";
                const trimmedKeyword = rawKeyword.trim();
                if (searchDebounceTimer) {
                    clearTimeout(searchDebounceTimer);
                }
                searchDebounceTimer = setTimeout(() => {
                    if (!trimmedKeyword) {
                        $scope.getAllMicrogrids();
                        return;
                    }
                MicrogridService.searchMicrogrids(trimmedKeyword, headers, function (response) {
                        if (angular.isDefined(response.status) && response.status === 200) {
                                $scope.microgrids = response.data;
                        } else {
                                $scope.microgrids = [];
                        }
                });
                }, 300);
        };

	$scope.addMicrogrid = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/microgrid/microgrid.model.html',
			controller: 'ModalAddMicrogridCtrl',
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
		modalInstance.result.then(function(microgrid) {
			microgrid.cost_center_id = microgrid.cost_center.id;
			microgrid.contact_id = microgrid.contact.id;
			microgrid.svg_id = microgrid.svg.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			MicrogridService.addMicrogrid(microgrid, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.MICROGRID")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitMicrogridChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.MICROGRID") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editMicrogrid = function(microgrid) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/microgrid/microgrid.model.html',
			controller: 'ModalEditMicrogridCtrl',
			resolve: {
				params: function() {
					return {
						microgrid: angular.copy(microgrid),
						costcenters:angular.copy($scope.costcenters),
						contacts:angular.copy($scope.contacts),
						svgs: angular.copy($scope.svgs),
						phaseoflifecycles: angular.copy($scope.phaseoflifecycles)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedMicrogrid) {
			modifiedMicrogrid.cost_center_id=modifiedMicrogrid.cost_center.id;
			modifiedMicrogrid.contact_id=modifiedMicrogrid.contact.id;
			modifiedMicrogrid.svg_id=modifiedMicrogrid.svg.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			MicrogridService.editMicrogrid(modifiedMicrogrid, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.MICROGRID")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitMicrogridChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.MICROGRID")}),
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

	$scope.deleteMicrogrid=function(microgrid){
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
		            MicrogridService.deleteMicrogrid(microgrid, headers, function(response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.MICROGRID")}),
								showCloseButton: true,
							});
							$scope.$emit('handleEmitMicrogridChanged');
						}else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.MICROGRID")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    });
	};

	$scope.exportMicrogrid = function(microgrid) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MicrogridService.exportMicrogrid(microgrid, headers, function(response) {
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

	$scope.cloneMicrogrid = function(microgrid){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MicrogridService.cloneMicrogrid(microgrid, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.MICROGRID")}),
					showCloseButton: true,
				});
				$scope.getAllMicrogrids();
				$scope.$emit('handleEmitMicrogridChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.MICROGRID")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importMicrogrid = function() {
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
			MicrogridService.importMicrogrid(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.MICROGRID")}),
						showCloseButton: true,
					});
					$scope.getAllMicrogrids();
					$scope.$emit('handleEmitMicrogridChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.MICROGRID") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllMicrogrids();
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	$scope.getAllSVGs();
	$scope.getAllPhaseOfLifecycles();
	$scope.$on('handleBroadcastMicrogridChanged', function(event) {
  		$scope.getAllMicrogrids();
	});
});

app.controller('ModalAddMicrogridCtrl', function($scope, $uibModalInstance,params) {

	$scope.operation = "SETTING.ADD_MICROGRID";
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.svgs=params.svgs;
	$scope.phaseoflifecycles=params.phaseoflifecycles;
	$scope.microgrid = {
		is_cost_data_displayed: false
	};
	$scope.ok = function() {
		$uibModalInstance.close($scope.microgrid);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditMicrogridCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_MICROGRID";
	$scope.microgrid = params.microgrid;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.svgs=params.svgs;
	$scope.phaseoflifecycles=params.phaseoflifecycles;
	$scope.ok = function() {
		$uibModalInstance.close($scope.microgrid);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
