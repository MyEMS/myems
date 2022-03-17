'use strict';

app.controller('CombinedEquipmentController', function (
    $scope,
    $window,
    $translate,
    $uibModal,
    CombinedEquipmentService,
    CostCenterService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllCombinedEquipments = function () {
		CombinedEquipmentService.getAllCombinedEquipments(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.combinedequipments = response.data;
			} else {
				$scope.combinedequipments = [];
			}
		});
	};

	$scope.getAllCostCenters = function () {
		CostCenterService.getAllCostCenters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			CombinedEquipmentService.addCombinedEquipment(combinedequipment, headers,function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("COMMON.COMBINED_EQUIPMENT") }),
						showCloseButton: true,
					});
					$scope.getAllCombinedEquipments();
					$scope.$emit('handleEmitCombinedEquipmentChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.COMBINED_EQUIPMENT") }),
						body: $translate.instant(response.data.description),
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			modifiedCombinedEquipment.cost_center_id = modifiedCombinedEquipment.cost_center.id;
			CombinedEquipmentService.editCombinedEquipment(modifiedCombinedEquipment, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("COMMON.COMBINED_EQUIPMENT") }),
						showCloseButton: true,
					});
					$scope.getAllCombinedEquipments();
					$scope.$emit('handleEmitCombinedEquipmentChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("COMMON.COMBINED_EQUIPMENT") }),
						body: $translate.instant(response.data.description),
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
					CombinedEquipmentService.deleteCombinedEquipment(combinedequipment, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("COMMON.COMBINED_EQUIPMENT") }),
								showCloseButton: true,
							});
							$scope.getAllCombinedEquipments();
							$scope.$emit('handleEmitCombinedEquipmentChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("COMMON.COMBINED_EQUIPMENT") }),
								body: $translate.instant(response.data.description),
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
