'use strict';

app.controller('CombinedEquipmentController', function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CombinedEquipmentService,
    CostCenterService,
    SVGService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.getAllCombinedEquipments = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CombinedEquipmentService.getAllCombinedEquipments(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.combinedequipments = response.data;
			} else {
				$scope.combinedequipments = [];
			}
		});
	};

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

	$scope.getAllSVGs = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token, "Quickmode": 'true'  };
		SVGService.getAllSVGs(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.svgs = response.data;
			} else {
				$scope.svgs = [];
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
						svgs: angular.copy($scope.svgs),
					};
				}
			}
		});
		modalInstance.result.then(function (combinedequipment) {
			combinedequipment.cost_center_id = combinedequipment.cost_center.id;
			if (angular.isDefined(combinedequipment.svg) && angular.isDefined(combinedequipment.svg.id)) {
				combinedequipment.svg_id = combinedequipment.svg.id;
			}
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
		$rootScope.modalInstance = modalInstance;
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
						svgs: angular.copy($scope.svgs),
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedCombinedEquipment) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			modifiedCombinedEquipment.cost_center_id = modifiedCombinedEquipment.cost_center.id;
			if (angular.isDefined(modifiedCombinedEquipment.svg) && angular.isDefined(modifiedCombinedEquipment.svg.id)) {
				modifiedCombinedEquipment.svg_id = modifiedCombinedEquipment.svg.id;
			}
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
		$rootScope.modalInstance = modalInstance;
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

	$scope.exportCombinedEquipment = function(combinedequipment) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CombinedEquipmentService.exportCombinedEquipment(combinedequipment, headers, function(response) {
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

	$scope.cloneCombinedEquipment = function(combinedequipment){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CombinedEquipmentService.cloneCombinedEquipment(combinedequipment, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.COMBINED_EQUIPMENT")}),
					showCloseButton: true,
				});
				$scope.getAllCombinedEquipments();
				$scope.$emit('handleEmitCombinedEquipmentChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.COMBINED_EQUIPMENT")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importCombinedEquipment = function() {
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
			CombinedEquipmentService.importCombinedEquipment(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.COMBINED_EQUIPMENT")}),
						showCloseButton: true,
					});
					$scope.getAllCombinedEquipments();
					$scope.$emit('handleEmitCombinedEquipmentChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMAND.COMBINED_EQUIPMENT") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllCostCenters();
	$scope.getAllSVGs();
	$scope.getAllCombinedEquipments();
});

app.controller("ModalAddCombinedEquipmentCtrl", function ($scope, $uibModalInstance, params) {
	$scope.operation = "COMBINED_EQUIPMENT.ADD_COMBINED_EQUIPMENT";
	$scope.costcenters = params.costcenters;
	$scope.svgs=params.svgs;
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
	$scope.svgs=params.svgs;
	$scope.disabled = true;
	$scope.combinedequipment = params.combinedequipment;

	$scope.ok = function () {
		$uibModalInstance.close($scope.combinedequipment);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss("cancel");
	};
});
