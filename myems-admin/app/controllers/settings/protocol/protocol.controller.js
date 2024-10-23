'use strict';

app.controller('ProtocolController', function($scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	ProtocolService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.getAllProtocols = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ProtocolService.getAllProtocols(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.protocols = response.data;
			} else {
				$scope.protocols = [];
			}
		});

	};

	$scope.addProtocol = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/protocol/protocol.model.html',
			controller: 'ModalAddProtocolCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						protocols: angular.copy($scope.protocols),
					};
				}
			}
		});
		modalInstance.result.then(function(protocol) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			ProtocolService.addProtocol(protocol, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
						showCloseButton: true,
					});
					$scope.getAllProtocols();
					$scope.$emit('handleEmitProtocolChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editProtocol = function(protocol) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/protocol/protocol.model.html',
			controller: 'ModalEditProtocolCtrl',
			resolve: {
				params: function() {
					return {
						protocol: angular.copy(protocol),
						protocols: angular.copy($scope.protocols),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedProtocol) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			ProtocolService.editProtocol(modifiedProtocol, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
						showCloseButton: true,
					});
					$scope.getAllProtocols();
					$scope.$emit('handleEmitProtocolChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
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

	$scope.deleteProtocol = function(protocol) {
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
				ProtocolService.deleteProtocol(protocol, headers, function(response) {
					if (angular.isDefined(response.status) && response.status === 204) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
							showCloseButton: true,
						});
						$scope.getAllProtocols();
						$scope.$emit('handleEmitProtocolChanged');
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}
		});
	};

	$scope.exportProtocol = function(protocol) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ProtocolService.exportProtocol(protocol, headers, function(response) {
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

	$scope.cloneProtocol = function(protocol){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ProtocolService.cloneProtocol(protocol, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitProtocolChanged');
				$scope.getAllProtocols();
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importProtocol = function() {
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
			ProtocolService.importProtocol(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("PROTOCOL.PROTOCOL")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitProtocolChanged');
					$scope.getAllProtocols();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("PROTOCOL.PROTOCOL") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllProtocols();
});

app.controller('ModalAddProtocolCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "PROTOCOL.ADD_PROTOCOL";
	$scope.ok = function() {
		$uibModalInstance.close($scope.protocol);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditProtocolCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "PROTOCOL.EDIT_PROTOCOL";
	$scope.protocol = params.protocol;
	$scope.protocols = params.protocols;
	$scope.ok = function() {
		$uibModalInstance.close($scope.protocol);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
