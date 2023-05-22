'use strict';

app.controller('MicrogridController', function(
    $scope,
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
		CostCenterService.getAllCostCenters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function() {
		ContactService.getAllContacts(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
			} else {
				$scope.contacts = [];
			}
		});
	};

	$scope.getAllMicrogrids = function() {
		MicrogridService.getAllMicrogrids(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgrids = response.data;
			} else {
				$scope.microgrids = [];
			}
		});
	};

    $scope.getAllMicrogridArchitectureTypes = function() {
        MicrogridArchitectureTypeService.getAllMicrogridArchitectureTypes(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.architecturetypes = response.data;
            } else {
                $scope.architecturetypes = [];
            }
        });
    };

    $scope.getAllMicrogridOwnerTypes = function() {
        MicrogridOwnerTypeService.getAllMicrogridOwnerTypes(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.ownertypes = response.data;
            } else {
                $scope.ownertypes = [];
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
						microgrids:angular.copy($scope.microgrids),
						architecturetypes: angular.copy($scope.architecturetypes),
						ownertypes: angular.copy($scope.ownertypes),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
					};
				}
			}
		});
		modalInstance.result.then(function(microgrid) {
	    	microgrid.microgrid_type_id=microgrid.microgrid_type.id;
			microgrid.cost_center_id=microgrid.cost_center.id;
			microgrid.contact_id=microgrid.contact.id;
			if (angular.isDefined(microgrid.is_input_counted) == false) {
				microgrid.is_input_counted = false;
			}
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
						architecturetypes:angular.copy($scope.architecturetypes),
						ownertypes:angular.copy($scope.ownertypes),
						costcenters:angular.copy($scope.costcenters),
						contacts:angular.copy($scope.contacts)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedMicrogrid) {
	    	modifiedMicrogrid.microgrid_type_id=modifiedMicrogrid.microgrid_type.id;
			modifiedMicrogrid.cost_center_id=modifiedMicrogrid.cost_center.id;
			modifiedMicrogrid.contact_id=modifiedMicrogrid.contact.id;
			if (angular.isDefined(microgrid.is_input_counted) == false) {
				microgrid.is_input_counted = false;
			}
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
	$scope.microgridtypes=params.microgridtypes;
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
	$scope.architecturetypes=params.architecturetypes;
	$scope.ownertypes=params.ownertypes;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.ok = function() {
		$uibModalInstance.close($scope.microgrid);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
