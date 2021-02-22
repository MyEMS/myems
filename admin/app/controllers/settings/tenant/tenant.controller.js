'use strict';

app.controller('TenantController', function ($scope, $common, $translate, $uibModal, CostCenterService, ContactService, TenantService, TenantTypeService, toaster, SweetAlert) {

	$scope.getAllCostCenters = function () {
		CostCenterService.getAllCostCenters(function (error, data) {
			if (!error) {
				$scope.costcenters = data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function () {
		ContactService.getAllContacts(function (error, data) {
			if (!error) {
				$scope.contacts = data;
			} else {
				$scope.contacts = [];
			}
		});
	};

	$scope.getAllTenants = function () {
		TenantService.getAllTenants(function (error, data) {
			if (!error) {
				$scope.tenants = data;
			} else {
				$scope.tenants = [];
			}
		});
	};

	$scope.getAllTenantTypes = function () {
		TenantTypeService.getAllTenantTypes(function (error, data) {
			if (!error) {
				$scope.tenanttypes = data;
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
			TenantService.addTenant(tenant, function (error, status) {
				if (angular.isDefined(status) && status == 201) {

					var templateName = "COMMON.TENANT";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });
					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

					$scope.$emit('handleEmitTenantChanged');
				} else {
					var templateName = "COMMON.TENANT";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
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
			TenantService.editTenant(modifiedTenant, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMMON.TENANT";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.$emit('handleEmitTenantChanged');
				} else {
					var templateName = "COMMON.TENANT";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
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
			title: $translate.instant($common.sweet.title),
			text: $translate.instant($common.sweet.text),
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: $translate.instant($common.sweet.confirmButtonText),
			cancelButtonText: $translate.instant($common.sweet.cancelButtonText),
			closeOnConfirm: true,
			closeOnCancel: true
		},
			function (isConfirm) {
				if (isConfirm) {
					TenantService.deleteTenant(tenant, function (error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "COMMON.TENANT";
							templateName = $translate.instant(templateName);

							var popType = 'TOASTER.SUCCESS';
							var popTitle = $common.toaster.success_title;
							var popBody = $common.toaster.success_delete_body;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody, { template: templateName });

							toaster.pop({
								type: popType,
								title: popTitle,
								body: popBody,
								showCloseButton: true,
							});
							$scope.$emit('handleEmitTenantChanged');
						} else if (angular.isDefined(status) && status == 400) {
							var popType = 'TOASTER.ERROR';
							var popTitle = error.title;
							var popBody = error.description;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody);

							toaster.pop({
								type: popType,
								title: popTitle,
								body: popBody,
								showCloseButton: true,
							});
						} else {
							var templateName = "COMMON.TENANT";
							templateName = $translate.instant(templateName);

							var popType = 'TOASTER.ERROR';
							var popTitle = $common.toaster.error_title;
							var popBody = $common.toaster.error_delete_body;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody, { template: templateName });

							toaster.pop({
								type: popType,
								title: popTitle,
								body: popBody,
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
			applyLabel: "确定",
			cancelLabel: "取消",
			customRangeLabel: "自定义",
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
			applyLabel: "确定",
			cancelLabel: "取消",
			customRangeLabel: "自定义",
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
