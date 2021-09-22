'use strict';

app.controller('TenantController', function ($scope, $translate, $uibModal, CostCenterService, ContactService, TenantService, TenantTypeService, toaster, SweetAlert) {

	$scope.getAllCostCenters = function () {
		CostCenterService.getAllCostCenters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function () {
		ContactService.getAllContacts(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
			} else {
				$scope.contacts = [];
			}
		});
	};

	$scope.getAllTenants = function () {
		TenantService.getAllTenants(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.tenants = response.data;
			} else {
				$scope.tenants = [];
			}
		});
	};

	$scope.getAllTenantTypes = function () {
		TenantTypeService.getAllTenantTypes(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.tenanttypes = response.data;
			} else {
				$scope.tenanttypes = [];
			}
		});
	};
	$scope.addTenant = function () {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/tenant/tenant.model.html',
			controller: 'ModalAddTenantCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function () {
					return {
						tenants: angular.copy($scope.tenants),
						tenanttypes: angular.copy($scope.tenanttypes),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
					};
				}
			}
		});
		modalInstance.result.then(function (tenant) {
			tenant.tenant_type_id = tenant.tenant_type.id;
			tenant.cost_center_id = tenant.cost_center.id;
			tenant.contact_id = tenant.contact.id;
			if (angular.isDefined(tenant.is_input_counted) == false) {
				tenant.is_input_counted = false;
			}
			if (angular.isDefined(tenant.is_key_tenant) == false) {
				tenant.is_key_tenant = false;
			}
			if (angular.isDefined(tenant.is_in_lease) == false) {
				tenant.is_in_lease = false;
			}
			TenantService.addTenant(tenant, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("COMMON.TENANT") }),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitTenantChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.TENANT") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {

		});
	};

	$scope.editTenant = function (tenant) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/tenant/tenant.model.html',
			controller: 'ModalEditTenantCtrl',
			resolve: {
				params: function () {
					return {
						tenant: angular.copy(tenant),
						tenanttypes: angular.copy($scope.tenanttypes),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts)
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedTenant) {
			modifiedTenant.tenant_type_id = modifiedTenant.tenant_type.id;
			modifiedTenant.cost_center_id = modifiedTenant.cost_center.id;
			modifiedTenant.contact_id = modifiedTenant.contact.id;
			if (angular.isDefined(tenant.is_input_counted) == false) {
				tenant.is_input_counted = false;
			}
			if (angular.isDefined(tenant.is_key_tenant) == false) {
				tenant.is_key_tenant = false;
			}
			if (angular.isDefined(tenant.is_in_lease) == false) {
				tenant.is_in_lease = false;
			}
			TenantService.editTenant(modifiedTenant, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("COMMON.TENANT") }),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitTenantChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("COMMON.TENANT") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
	};

	$scope.deleteTenant = function (tenant) {
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
					TenantService.deleteTenant(tenant, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("COMMON.TENANT") }),
								showCloseButton: true,
							});
							$scope.$emit('handleEmitTenantChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("COMMON.TENANT") }),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};
	$scope.getAllTenants();
	$scope.getAllTenantTypes();
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	$scope.$on('handleBroadcastTenantChanged', function (event) {
		$scope.getAllTenants();
	});
});

app.controller('ModalAddTenantCtrl', function ($scope, $uibModalInstance, params) {

	$scope.operation = "SETTING.ADD_TENANT";
	$scope.tenanttypes = params.tenanttypes;
	$scope.costcenters = params.costcenters;
	$scope.contacts = params.contacts;
	$scope.tenant = {
		lease_start_datetime_utc: moment(),
		lease_end_datetime_utc: moment(),
	};
	$scope.dtOptions = {
		locale: {
			format: 'YYYY-MM-DD HH:mm:ss',
			applyLabel: "OK",
			cancelLabel: "Cancel",
		},
		timePicker: true,
		timePicker24Hour: true,
		timePickerIncrement: 15,
		singleDatePicker: true,
	};
	$scope.ok = function () {
		$scope.tenant.lease_start_datetime_utc = moment($scope.tenant.lease_start_datetime_utc).format().slice(0, 19);
		$scope.tenant.lease_end_datetime_utc = moment($scope.tenant.lease_end_datetime_utc).format().slice(0, 19);
		$uibModalInstance.close($scope.tenant);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditTenantCtrl', function ($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_TENANT";
	$scope.tenant = params.tenant;
	$scope.tenanttypes = params.tenanttypes;
	$scope.costcenters = params.costcenters;
	$scope.contacts = params.contacts;
	$scope.dtOptions = {
		locale: {
			format: 'YYYY-MM-DD HH:mm:ss',
			applyLabel: "OK",
			cancelLabel: "Cancel",
		},
		timePicker: true,
		timePicker24Hour: true,
		timePickerIncrement: 15,
		singleDatePicker: true,
	};
	$scope.ok = function () {
		$scope.tenant.lease_start_datetime_utc = moment($scope.tenant.lease_start_datetime_utc).format().slice(0, 19);
		$scope.tenant.lease_end_datetime_utc = moment($scope.tenant.lease_end_datetime_utc).format().slice(0, 19);
		$uibModalInstance.close($scope.tenant);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
