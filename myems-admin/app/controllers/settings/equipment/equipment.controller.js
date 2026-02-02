'use strict';

app.controller('EquipmentController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EquipmentService,
	CostCenterService,
    SVGService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';
	$scope.searchEquipmentKeyword = '';
    $scope.searchTimeout = null;

	$scope.getAllEquipments = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EquipmentService.getAllEquipments(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.equipments = response.data;
			} else {
				$scope.equipments = [];
			}
		});
	};

    $scope.searchEquipments = function() {
        if ($scope.searchTimeout) {
            clearTimeout($scope.searchTimeout);
        }

        $scope.searchTimeout = setTimeout(function() {
            let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
            var searchQuery = $scope.searchEquipmentKeyword.trim();

            if (searchQuery === '') {
                $scope.getAllEquipments();
            } else {
                EquipmentService.searchEquipments(searchQuery, headers, function (response) {
                    if (angular.isDefined(response.status) && response.status === 200) {
                        $scope.equipments = response.data;
                    } else {
                        $scope.equipments = [];
                    }
                });
            }
        }, 300);
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

	$scope.addEquipment = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/equipment/equipment.model.html',
			controller: 'ModalAddEquipmentCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						costcenters: angular.copy($scope.costcenters),
						svgs: angular.copy($scope.svgs),
					};
				}
			}
		});
		modalInstance.result.then(function(equipment) {
			equipment.cost_center_id = equipment.cost_center.id;
			if (angular.isDefined(equipment.svg) && angular.isDefined(equipment.svg.id)) {
				equipment.svg_id = equipment.svg.id;
			}
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EquipmentService.addEquipment(equipment, headers, function (response) {
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
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
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
						svgs: angular.copy($scope.svgs),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedEquipment) {
		  	modifiedEquipment.cost_center_id = modifiedEquipment.cost_center.id;
			if (angular.isDefined(modifiedEquipment.svg) && modifiedEquipment.svg != null && angular.isDefined(modifiedEquipment.svg.id)) {
				modifiedEquipment.svg_id = modifiedEquipment.svg.id;
			}
		  	let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EquipmentService.editEquipment(modifiedEquipment, headers, function (response) {
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
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
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
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		            EquipmentService.deleteEquipment(equipment, headers, function (response) {
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
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    });
	};

	$scope.exportEquipment = function(equipment) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EquipmentService.exportEquipment(equipment, headers, function(response) {
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

	$scope.cloneEquipment = function(equipment){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EquipmentService.cloneEquipment(equipment, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
					showCloseButton: true,
				});
				$scope.getAllEquipments();
				$scope.$emit('handleEmitEquipmentChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.EQUIPMENT")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importEquipment = function() {
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
			EquipmentService.importEquipment(importdata, headers, function(response) {
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
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.EQUIPMENT") }),
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
	$scope.getAllEquipments();
});

app.controller("ModalAddEquipmentCtrl", function(  $scope,  $uibModalInstance, params) {
  	$scope.operation = "EQUIPMENT.ADD_EQUIPMENT";
  	$scope.costcenters = params.costcenters;
	$scope.svgs=params.svgs;
  	$scope.disabled = false;
  	$scope.equipment = {
    	is_input_counted: false,
    	is_output_counted: false,
    	efficiency_indicator: 0.0,
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
	$scope.svgs=params.svgs;
  	$scope.disabled = true;
  	$scope.equipment = params.equipment;

	$scope.ok = function() {
		$uibModalInstance.close($scope.equipment);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss("cancel");
	};
});
