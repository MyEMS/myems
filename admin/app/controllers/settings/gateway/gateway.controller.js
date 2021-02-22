'use strict';

app.controller('GatewayController', function($scope,  $translate,$common, $uibModal, GatewayService, toaster, SweetAlert) {

	$scope.getAllGateways = function() {
		GatewayService.getAllGateways(function(error, data) {
			if (!error) {
				$scope.gateways = data;
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
			GatewayService.addGateway(gateway, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "GATEWAY.GATEWAY";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getAllGateways();
					$scope.$emit('handleEmitGatewayChanged');
				} else {
					var templateName = "GATEWAY.GATEWAY";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
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
			GatewayService.editGateway(modifiedGateway, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "GATEWAY.GATEWAY";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getAllGateways();
					$scope.$emit('handleEmitGatewayChanged');
				} else {
					var templateName = "GATEWAY.GATEWAY";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
	};

	$scope.deleteGateway = function(gateway) {
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
			function(isConfirm) {
				if (isConfirm) {
					GatewayService.deleteGateway(gateway, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "GATEWAY.GATEWAY";
                            templateName = $translate.instant(templateName);

                            var popType = 'TOASTER.SUCCESS';
                            var popTitle = $common.toaster.success_title;
                            var popBody = $common.toaster.success_delete_body;

                            popType = $translate.instant(popType);
                            popTitle = $translate.instant(popTitle);
                            popBody = $translate.instant(popBody, {template: templateName});

                            toaster.pop({
                                type: popType,
                                title: popTitle,
                                body: popBody,
                                showCloseButton: true,
                            });
							$scope.getAllGateways();
							$scope.$emit('handleEmitGatewayChanged');
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
							var templateName = "GATEWAY.GATEWAY";
							templateName = $translate.instant(templateName);

							var popType = 'TOASTER.ERROR';
							var popTitle = $common.toaster.error_title;
							var popBody = $common.toaster.error_delete_body;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody, {template: templateName});

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
