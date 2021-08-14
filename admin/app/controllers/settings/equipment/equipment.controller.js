'use strict';

app.controller('EquipmentController', function($scope, $translate, $uibModal, EquipmentService, CostCenterService, toaster,SweetAlert) {

	$scope.getAllEquipments = function() {
		EquipmentService.getAllEquipments(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.equipments = response.data;
			} else {
				$scope.equipments = [];
			}
		});
	};

	$scope.getAllCostCenters = function() {
		CostCenterService.getAllCostCenters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};
	$scope.addEquipment = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/equipment/equipment.model.html',
			controller: 'ModalAddEquipmentCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						costcenters: angular.copy($scope.costcenters),
					};
				}
			}
		});
		modalInstance.result.then(function(equipment) {
		  equipment.cost_center_id = equipment.cost_center.id;
			EquipmentService.addEquipment(equipment, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
						showCloseButton: true,
					});
					$scope.getAllEquipments();
					$scope.$emit('handleEmitEquipmentChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editEquipment = function(equipment) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/equipment/equipment.model.html',
			controller: 'ModalEditEquipmentCtrl',
			resolve: {
				params: function() {
					return {
						equipment: angular.copy(equipment),
						costcenters: angular.copy($scope.costcenters),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedEquipment) {
		  modifiedEquipment.cost_center_id = modifiedEquipment.cost_center.id;
			EquipmentService.editEquipment(modifiedEquipment, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
						showCloseButton: true,
					});
					$scope.getAllEquipments();
					$scope.$emit('handleEmitEquipmentChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
	};

	$scope.deleteEquipment=function(equipment){
		SweetAlert.swal({
		        title: $translate.instant("SWEET.TITLE"),
		        text: $translate.instant("SWEET.TEXT"),
		        type: "warning",
		        showCancelButton: true,
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
		        cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
		        closeOnConfirm: true,
		        closeOnCancel: true },
		    function (isConfirm) {
		        if (isConfirm) {
		            EquipmentService.deleteEquipment(equipment, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
								showCloseButton: true,
							});
							$scope.getAllEquipments();
							$scope.$emit('handleEmitEquipmentChanged');
		            	} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.FAILURE_TITLE"),
								body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    });
	};
	$scope.getAllCostCenters();
	$scope.getAllEquipments();
});

app.controller("ModalAddEquipmentCtrl", function(  $scope,  $uibModalInstance, params) {
  $scope.operation = "EQUIPMENT.ADD_EQUIPMENT";
	$scope.costcenters = params.costcenters;
  $scope.disabled = false;
  $scope.equipment = {
    is_input_counted: false,
    is_output_counted: false,
  };
  $scope.ok = function() {
    $uibModalInstance.close($scope.equipment);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
});

app.controller("ModalEditEquipmentCtrl", function($scope, $uibModalInstance,  params) {
  $scope.operation = "EQUIPMENT.EDIT_EQUIPMENT";
	$scope.costcenters = params.costcenters;
  $scope.disabled = true;
  $scope.equipment = params.equipment;

  $scope.ok = function() {
    $uibModalInstance.close($scope.equipment);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
});
