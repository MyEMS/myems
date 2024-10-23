'use strict';

app.controller('GatewayController', function($scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	GatewayService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.getAllGateways = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		GatewayService.getAllGateways(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.gateways = response.data;
			} else {
				$scope.gateways = [];
			}
		});

	};

	$scope.addGateway = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/gateway/gateway.model.html',
			controller: 'ModalAddGatewayCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						gateways: angular.copy($scope.gateways),
					};
				}
			}
		});
		modalInstance.result.then(function(gateway) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			GatewayService.addGateway(gateway, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
						showCloseButton: true,
					});
					$scope.getAllGateways();
					$scope.$emit('handleEmitGatewayChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editGateway = function(gateway) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/gateway/gateway.model.html',
			controller: 'ModalEditGatewayCtrl',
			resolve: {
				params: function() {
					return {
						gateway: angular.copy(gateway),
						gateways: angular.copy($scope.gateways),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedGateway) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			GatewayService.editGateway(modifiedGateway, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
						showCloseButton: true,
					});
					$scope.getAllGateways();
					$scope.$emit('handleEmitGatewayChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
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

	$scope.deleteGateway = function(gateway) {
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
		function(isConfirm) {
			if (isConfirm) {
				let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
				GatewayService.deleteGateway(gateway, headers, function(response) {
					if (angular.isDefined(response.status) && response.status === 204) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
							showCloseButton: true,
						});
						$scope.getAllGateways();
						$scope.$emit('handleEmitGatewayChanged');
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}
		});
	};

	$scope.exportGateway = function(gateway) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		GatewayService.exportGateway(gateway, headers, function(response) {
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

	$scope.cloneGateway = function(gateway){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		GatewayService.cloneGateway(gateway, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitGatewayChanged');
				$scope.getAllGateways();
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importGateway = function() {
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
			GatewayService.importGateway(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("GATEWAY.GATEWAY")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitGatewayChanged');
					$scope.getAllGateways();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("GATEWAY.GATEWAY") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllGateways();
});

app.controller('ModalAddGatewayCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "GATEWAY.ADD_GATEWAY";
	$scope.ok = function() {
		$uibModalInstance.close($scope.gateway);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditGatewayCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "GATEWAY.EDIT_GATEWAY";
	$scope.gateway = params.gateway;
	$scope.gateways = params.gateways;
	$scope.ok = function() {
		$uibModalInstance.close($scope.gateway);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
