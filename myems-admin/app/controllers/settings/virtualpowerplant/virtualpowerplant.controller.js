'use strict';

app.controller('VirtualPowerPlantController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
	PointService,
    VirtualPowerPlantService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllVirtualPowerPlants = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		VirtualPowerPlantService.getAllVirtualPowerPlants(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.virtualpowerplants = response.data;
			} else {
				$scope.virtualpowerplants = [];
			}
		});
	};
	$scope.getAllCostCenters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CostCenterService.getAllCostCenters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

    $scope.getAllPoints = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		PointService.getAllPoints(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.points = response.data;
			} else {
				$scope.points = [];
			}
		});
	};

	$scope.addVirtualPowerPlant = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/virtualpowerplant/virtualpowerplant.model.html',
			controller: 'ModalAddVirtualPowerPlantCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						costcenters: angular.copy($scope.costcenters),
						points: angular.copy($scope.points),
					};
				}
			}
		});
		modalInstance.result.then(function(virtualpowerplant) {
			virtualpowerplant.cost_center_id = virtualpowerplant.cost_center.id;
			virtualpowerplant.balancing_price_point_id = virtualpowerplant.balancing_price_point.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			VirtualPowerPlantService.addVirtualPowerPlant(virtualpowerplant, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.VIRTUAL_POWER_PLANT")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitVirtualPowerPlantChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.VIRTUAL_POWER_PLANT") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editVirtualPowerPlant = function(virtualpowerplant) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/virtualpowerplant/virtualpowerplant.model.html',
			controller: 'ModalEditVirtualPowerPlantCtrl',
			resolve: {
				params: function() {
					return {
						virtualpowerplant: angular.copy(virtualpowerplant),
						costcenters: angular.copy($scope.costcenters),
						points: angular.copy($scope.points),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedVirtualPowerPlant) {
			modifiedVirtualPowerPlant.cost_center_id=modifiedVirtualPowerPlant.cost_center.id;
			modifiedVirtualPowerPlant.balancing_price_point_id = modifiedVirtualPowerPlant.balancing_price_point.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			VirtualPowerPlantService.editVirtualPowerPlant(modifiedVirtualPowerPlant, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.VIRTUAL_POWER_PLANT")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitVirtualPowerPlantChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.VIRTUAL_POWER_PLANT")}),
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

	$scope.deleteVirtualPowerPlant=function(virtualpowerplant){
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
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		            VirtualPowerPlantService.deleteVirtualPowerPlant(virtualpowerplant, headers, function(response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.VIRTUAL_POWER_PLANT")}),
								showCloseButton: true,
							});
							$scope.$emit('handleEmitVirtualPowerPlantChanged');
						}else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.VIRTUAL_POWER_PLANT")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    }
		);
	};

	$scope.getAllVirtualPowerPlants();
	$scope.getAllCostCenters();
	$scope.getAllPoints();

	$scope.$on('handleBroadcastVirtualPowerPlantChanged', function(event) {
  		$scope.getAllVirtualPowerPlants();
	});
});

app.controller('ModalAddVirtualPowerPlantCtrl', function($scope, $uibModalInstance,params) {

	$scope.operation = "SETTING.ADD_VIRTUAL_POWER_PLANT";
	$scope.costcenters=params.costcenters;
	$scope.points=params.points;

	$scope.ok = function() {
		$uibModalInstance.close($scope.virtualpowerplant);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditVirtualPowerPlantCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_VIRTUAL_POWER_PLANT";
	$scope.virtualpowerplant = params.virtualpowerplant;
	$scope.costcenters=params.costcenters;
	$scope.points=params.points;

	$scope.ok = function() {
		$uibModalInstance.close($scope.virtualpowerplant);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
