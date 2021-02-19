'use strict';

app.controller('CombinedEquipmentController', function ($scope, $common, $translate, $uibModal, CombinedEquipmentService, CostCenterService, toaster, SweetAlert) {

	$scope.getAllCombinedEquipments = function () {
		CombinedEquipmentService.getAllCombinedEquipments(function (error, data) {
			if (!error) {
				$scope.combinedequipments = data;
			} else {
				$scope.combinedequipments = [];
			}
		});
	};

	$scope.getAllCostCenters = function () {
		CostCenterService.getAllCostCenters(function (error, data) {
			if (!error) {
				$scope.costcenters = data;
			} else {
				$scope.costcenters = [];
			}
		});
	};
	$scope.addCombinedEquipment = function () {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/combinedequipment/combinedequipment.model.html',
			controller: 'ModalAddCombinedEquipmentCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function () {
					return {
						costcenters: angular.copy($scope.costcenters),
					};
				}
			}
		});
		modalInstance.result.then(function (combinedequipment) {
			combinedequipment.cost_center_id = combinedequipment.cost_center.id;
			CombinedEquipmentService.addCombinedEquipment(combinedequipment, function (error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "COMMON.COMBINED_EQUIPMENT";
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
					$scope.getAllCombinedEquipments();
					$scope.$emit('handleEmitCombinedEquipmentChanged');
				} else {
					var templateName = "COMMON.COMBINED_EQUIPMENT";
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

	$scope.editCombinedEquipment = function (combinedequipment) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/combinedequipment/combinedequipment.model.html',
			controller: 'ModalEditCombinedEquipmentCtrl',
			resolve: {
				params: function () {
					return {
						combinedequipment: angular.copy(combinedequipment),
						costcenters: angular.copy($scope.costcenters),
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedCombinedEquipment) {
			modifiedCombinedEquipment.cost_center_id = modifiedCombinedEquipment.cost_center.id;
			CombinedEquipmentService.editCombinedEquipment(modifiedEquipment, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMMON.COMBINED_EQUIPMENT";
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
					$scope.getAllCombinedEquipments();
					$scope.$emit('handleEmitCombinedEquipmentChanged');
				} else {
					var templateName = "COMMON.COMBINED_EQUIPMENT";
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

	$scope.deleteCombinedEquipment = function (combinedequipment) {
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
					CombinedEquipmentService.deleteCombinedEquipment(combinedequipment, function (error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "COMMON.COMBINED_EQUIPMENT";
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
							$scope.getAllCombinedEquipments();
							$scope.$emit('handleEmitCombinedEquipmentChanged');
						} else {
							var templateName = "COMMON.COMBINED_EQUIPMENT";
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
	$scope.getAllCostCenters();
	$scope.getAllCombinedEquipments();
});

app.controller("ModalAddCombinedEquipmentCtrl", function ($scope, $uibModalInstance, params) {
	$scope.operation = "COMBINED_EQUIPMENT.ADD_COMBINED_EQUIPMENT";
	$scope.costcenters = params.costcenters;
	$scope.disabled = false;
	$scope.combinedequipment = {
		is_input_counted: false,
		is_output_counted: false,
	};
	$scope.ok = function () {
		$uibModalInstance.close($scope.combinedequipment);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss("cancel");
	};
});

app.controller("ModalEditCombinedEquipmentCtrl", function ($scope, $uibModalInstance, params) {
	$scope.operation = "COMBINED_EQUIPMENT.EDIT_COMBINED_EQUIPMENT";
	$scope.costcenters = params.costcenters;
	$scope.disabled = true;
	$scope.combinedequipment = params.combinedequipment;

	$scope.ok = function () {
		$uibModalInstance.close($scope.combinedequipment);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss("cancel");
	};
});
