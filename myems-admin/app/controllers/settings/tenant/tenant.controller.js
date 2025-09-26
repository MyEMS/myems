'use strict';

app.controller('TenantController', function (
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	CostCenterService,
	ContactService,
	TenantService,
	TenantTypeService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';
	$scope.tenantTypes = [];
	$scope.searchTenantKeyword = '';
	$scope.getAllCostCenters = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CostCenterService.getAllCostCenters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ContactService.getAllContacts(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
			} else {
				$scope.contacts = [];
			}
		});
	};

	$scope.getAllTenants = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantService.getAllTenants(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.tenants = response.data;
			} else {
				$scope.tenants = [];
			}
		});
	};

	$scope.getAllTenantTypes = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantTypeService.getAllTenantTypes(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.tenantTypes.length = 0;
				Array.prototype.push.apply($scope.tenantTypes, response.data);
			} else {
				$scope.tenantTypes.length = 0;
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
						tenantTypes: $scope.tenantTypes,
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			TenantService.addTenant(tenant, headers, function (response) {
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
		$rootScope.modalInstance = modalInstance;
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
						tenantTypes: $scope.tenantTypes,
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			TenantService.editTenant(modifiedTenant, headers, function (response) {
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
		});
		$rootScope.modalInstance = modalInstance;
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
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
					TenantService.deleteTenant(tenant, headers, function (response) {
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

	$scope.exportTenant = function(tenant) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantService.exportTenant(tenant, headers, function(response) {
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
				}, function() {
				});
				$rootScope.modalInstance = modalInstance;
			} else {
				$scope.exportdata = null;
			}
		});
	};

	$scope.cloneTenant = function(tenant){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantService.cloneTenant(tenant, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.TENANT")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitTenantChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.TENANT")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importTenant = function() {
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
			TenantService.importTenant(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.TENANT")}),
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
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};
	let searchDebounceTimer = null;
	function safeApply(scope) {
		if (!scope.$$phase && !scope.$root.$$phase) {
			scope.$apply();
		}
	}
	$scope.searchTenant = function() {
		const headers = {
			"User-UUID": $scope.cur_user?.uuid,
			"Token": $scope.cur_user?.token
		};

		const rawKeyword = $scope.searchTenantKeyword || "";
		const trimmedKeyword = rawKeyword.trim();

		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}

		searchDebounceTimer = setTimeout(() => {
			if (!trimmedKeyword) {
				$scope.getAllTenants();
				safeApply($scope);
				return;
			}

			TenantService.searchTenants(trimmedKeyword, headers, (response) => {
				$scope.tenants = (response.status === 200) ? response.data : [];
				$scope.parentmeters = [...$scope.tenants];
			});
		}, 300);
	};
	$scope.getAllTenants();
	$scope.getAllTenantTypes(); 
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	
	$scope.$on('handleBroadcastTenantTypeChanged', function() {
		$scope.getAllTenantTypes();
	});
	
	$scope.$on('handleBroadcastTenantChanged', function (event) {
		$scope.getAllTenants();
	});
});

app.controller('ModalAddTenantCtrl', function ($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.ADD_TENANT";
	$scope.tenanttypes = params.tenantTypes;
	$scope.costcenters = params.costcenters;
	$scope.contacts = params.contacts;
	$scope.tenant = {
		lease_start_datetime: moment(),
		lease_end_datetime: moment()
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
	
	$scope.isLeaseDateInvalid = function () {
		if (!$scope.tenant.lease_start_datetime || !$scope.tenant.lease_end_datetime) {
			return false;
		}
		const start = moment($scope.tenant.lease_start_datetime);
		const end = moment($scope.tenant.lease_end_datetime);
		if (!start.isValid() || !end.isValid()) {
			return false;
		}
		return end.isSameOrBefore(start);
	};

	$scope.ok = function () {
		$scope.tenant.lease_start_datetime = moment($scope.tenant.lease_start_datetime).format().slice(0, 19);
		 if ($scope.tenant.lease_end_datetime) {
            $scope.tenant.lease_end_datetime = moment($scope.tenant.lease_end_datetime).format().slice(0, 19);
        } else {
            $scope.tenant.lease_end_datetime = null;
        }
		$uibModalInstance.close($scope.tenant);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditTenantCtrl', function ($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_TENANT";
	$scope.tenant = params.tenant;
	$scope.tenanttypes = params.tenantTypes;
	$scope.costcenters = params.costcenters;
	$scope.contacts = params.contacts;
	  if (!$scope.tenant.lease_end_datetime) {
        $scope.tenant.lease_end_datetime = moment(); 
    }
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
	$scope.isLeaseDateInvalid = function () {
		if (!$scope.tenant.lease_start_datetime || !$scope.tenant.lease_end_datetime) {
			return false;
		}
		const start = moment($scope.tenant.lease_start_datetime);
		const end = moment($scope.tenant.lease_end_datetime);
		if (!start.isValid() || !end.isValid()) {
			return false;
		}
		return end.isSameOrBefore(start);
	};
	
	$scope.ok = function () {
		$scope.tenant.lease_start_datetime = moment($scope.tenant.lease_start_datetime).format().slice(0, 19);
		 if ($scope.tenant.lease_end_datetime) {
            $scope.tenant.lease_end_datetime = moment($scope.tenant.lease_end_datetime).format().slice(0, 19);
        } else {
            $scope.tenant.lease_end_datetime = null;
        }
		$uibModalInstance.close($scope.tenant);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});