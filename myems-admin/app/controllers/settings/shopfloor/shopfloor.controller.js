'use strict';

app.controller('ShopfloorController', function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
    ContactService,
    ShopfloorService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

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

	$scope.getAllShopfloors = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ShopfloorService.getAllShopfloors(headers,function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.shopfloors = response.data;
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			ShopfloorService.addShopfloor(shopfloor, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("COMMON.SHOPFLOOR") }),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitShopfloorChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.SHOPFLOOR") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editShopfloor = function(shopfloor) {
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

		modalInstance.result.then(function(modifiedShopfloor) {
			console.log(modifiedShopfloor);
			modifiedShopfloor.cost_center_id = modifiedShopfloor.cost_center.id;
			modifiedShopfloor.contact_id = modifiedShopfloor.contact.id;
			if (angular.isDefined(shopfloor.is_input_counted) == false) {
				shopfloor.is_input_counted = false;
			}
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			ShopfloorService.editShopfloor(modifiedShopfloor, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("COMMON.SHOPFLOOR") }),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitShopfloorChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("COMMON.SHOPFLOOR") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.deleteShopfloor = function (shopfloor) {
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
					ShopfloorService.deleteShopfloor(shopfloor, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("COMMON.SHOPFLOOR") }),
								showCloseButton: true,
							});
							$scope.$emit('handleEmitShopfloorChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("COMMON.SHOPFLOOR") }),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.exportShopfloor = function(shopfloor) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ShopfloorService.exportShopfloor(shopfloor, headers, function(response) {
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

	$scope.cloneShopfloor = function(shopfloor){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ShopfloorService.cloneShopfloor(shopfloor, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SHOPFLOOR")}),
					showCloseButton: true,
				});
				$scope.getAllShopfloors();
				$scope.$emit('handleEmitShopfloorChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.SHOPFLOOR")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importShopfloor = function() {
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
			ShopfloorService.importShopfloor(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SHOPFLOOR")}),
						showCloseButton: true,
					});
					$scope.getAllShopfloors();
					$scope.$emit('handleEmitShopfloorChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.SHOPFLOOR") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
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
		$uibModalInstance.close($scope.shopfloor);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
