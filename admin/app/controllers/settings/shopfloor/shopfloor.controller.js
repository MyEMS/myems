'use strict';

app.controller('ShopfloorController', function ($scope, $common, $translate, $uibModal, CostCenterService, ContactService, ShopfloorService, toaster, SweetAlert) {

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

	$scope.getAllShopfloors = function () {
		ShopfloorService.getAllShopfloors(function (error, data) {
			if (!error) {
				$scope.shopfloors = data;
			} else {
				$scope.shopfloors = [];
			}
		});
	};

	$scope.addShopfloor = function () {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/shopfloor/shopfloor.model.html',
			controller: 'ModalAddShopfloorCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function () {
					return {
						shopfloors: angular.copy($scope.shopfloors),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
					};
				}
			}
		});
		modalInstance.result.then(function (shopfloor) {
			shopfloor.cost_center_id = shopfloor.cost_center.id;
			shopfloor.contact_id = shopfloor.contact.id;
			if (angular.isDefined(shopfloor.is_input_counted) == false) {
				shopfloor.is_input_counted = false;
			}
			ShopfloorService.addShopfloor(shopfloor, function (error, status) {
				if (angular.isDefined(status) && status == 201) {

					var templateName = "COMMON.SHOPFLOOR";
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

					$scope.$emit('handleEmitShopfloorChanged');
				} else {
					var templateName = "COMMON.SHOPFLOOR";
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

	$scope.editShopfloor = function (shopfloor) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/shopfloor/shopfloor.model.html',
			controller: 'ModalEditShopfloorCtrl',
			resolve: {
				params: function () {
					return {
						shopfloor: angular.copy(shopfloor),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts)
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedShopfloor) {
			modifiedShopfloor.cost_center_id = modifiedShopfloor.cost_center.id;
			modifiedShopfloor.contact_id = modifiedShopfloor.contact.id;
			if (angular.isDefined(shopfloor.is_input_counted) == false) {
				shopfloor.is_input_counted = false;
			}
			ShopfloorService.editShopfloor(modifiedShopfloor, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMMON.SHOPFLOOR";
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
					$scope.$emit('handleEmitShopfloorChanged');
				} else {
					var templateName = "COMMON.SHOPFLOOR";
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

	$scope.deleteShopfloor = function (shopfloor) {
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
					ShopfloorService.deleteShopfloor(shopfloor, function (error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "COMMON.SHOPFLOOR";
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
							$scope.$emit('handleEmitShopfloorChanged');
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
							var templateName = "COMMON.SHOPFLOOR";
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
	$scope.getAllShopfloors();
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	$scope.$on('handleBroadcastShopfloorChanged', function (event) {
		$scope.getAllShopfloors();
	});
});

app.controller('ModalAddShopfloorCtrl', function ($scope, $uibModalInstance, params) {

	$scope.operation = "SHOPFLOOR.ADD_SHOPFLOOR";
	$scope.costcenters = params.costcenters;
	$scope.contacts = params.contacts;
	$scope.ok = function () {
		$uibModalInstance.close($scope.shopfloor);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditShopfloorCtrl', function ($scope, $uibModalInstance, params) {
	$scope.operation = "SHOPFLOOR.EDIT_SHOPFLOOR";
	$scope.shopfloor = params.shopfloor;
	$scope.costcenters = params.costcenters;
	$scope.contacts = params.contacts;
	
	$scope.ok = function () {
		$uibModalInstance.close($scope.tenant);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
