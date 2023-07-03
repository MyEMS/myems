'use strict';

app.controller('MicrogridController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
    ContactService,
    MicrogridService,
    MicrogridArchitectureTypeService,
    MicrogridOwnerTypeService,
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

    $scope.getAllMicrogridArchitectureTypes = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridArchitectureTypeService.getAllMicrogridArchitectureTypes(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.microgridarchitecturetypes = response.data;
            } else {
                $scope.microgridarchitecturetypes = [];
            }
        });
    };

    $scope.getAllMicrogridOwnerTypes = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridOwnerTypeService.getAllMicrogridOwnerTypes(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.microgridownertypes = response.data;
            } else {
                $scope.microgridownertypes = [];
            }
        });
    };

	$scope.addMicrogrid = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/microgrid/microgrid.model.html',
			controller: 'ModalAddMicrogridCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						microgridarchitecturetypes: angular.copy($scope.microgridarchitecturetypes),
						microgridownertypes: angular.copy($scope.microgridownertypes),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
					};
				}
			}
		});
		modalInstance.result.then(function(microgrid) {
			microgrid.architecture_type_id = microgrid.architecture_type.id;
			microgrid.owner_type_id = microgrid.owner_type.id;
			microgrid.cost_center_id = microgrid.cost_center.id;
			microgrid.contact_id = microgrid.contact.id;
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
						microgridarchitecturetypes:angular.copy($scope.microgridarchitecturetypes),
						microgridownertypes:angular.copy($scope.microgridownertypes),
						costcenters:angular.copy($scope.costcenters),
						contacts:angular.copy($scope.contacts)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedMicrogrid) {
			modifiedMicrogrid.architecture_type_id=modifiedMicrogrid.architecture_type.id;
			modifiedMicrogrid.owner_type_id=modifiedMicrogrid.owner_type.id;
			modifiedMicrogrid.cost_center_id=modifiedMicrogrid.cost_center.id;
			modifiedMicrogrid.contact_id=modifiedMicrogrid.contact.id;

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
	$scope.getAllMicrogrids();
	$scope.getAllMicrogridArchitectureTypes();
	$scope.getAllMicrogridOwnerTypes();
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	$scope.$on('handleBroadcastMicrogridChanged', function(event) {
  		$scope.getAllMicrogrids();
	});
});

app.controller('ModalAddMicrogridCtrl', function($scope, $uibModalInstance,params) {

	$scope.operation = "SETTING.ADD_MICROGRID";
	$scope.microgridarchitecturetypes=params.microgridarchitecturetypes;
	$scope.microgridownertypes=params.microgridownertypes;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
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
	$scope.microgridarchitecturetypes=params.microgridarchitecturetypes;
	$scope.microgridownertypes=params.microgridownertypes;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.ok = function() {
		$uibModalInstance.close($scope.microgrid);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
