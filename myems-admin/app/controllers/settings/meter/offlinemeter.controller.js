'use strict';

app.controller('OfflineMeterController', function(
	$scope,
	$window,
	$translate,
	$uibModal,
	OfflineMeterService,
	CategoryService,
	EnergyItemService,
	CostCenterService,
	toaster,
	SweetAlert) {

	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllCostCenters = function() {
		CostCenterService.getAllCostCenters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllCategories = function() {
		CategoryService.getAllCategories(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.categories = response.data;
			} else {
				$scope.categories = [];
			}
		});
	};

	$scope.getAllEnergyItems = function() {
		EnergyItemService.getAllEnergyItems(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energyitems = response.data;
			} else {
				$scope.energyitems = [];
			}
		});
	};

	$scope.getAllOfflineMeters = function() {
		OfflineMeterService.getAllOfflineMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeters = response.data;
			} else {
				$scope.offlinemeters = [];
			}
		});

	};

	$scope.addOfflineMeter = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/meter/offlinemeter.model.html',
			controller: 'ModalAddOfflineMeterCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						offlinemeters: angular.copy($scope.offlinemeters),
						categories: angular.copy($scope.categories),
						energyitems: angular.copy($scope.energyitems),
						costcenters: angular.copy($scope.costcenters)
					};
				}
			}
		});
		modalInstance.result.then(function(offlinemeter) {
			offlinemeter.energy_category_id = offlinemeter.energy_category.id;
			if(angular.isDefined(offlinemeter.energy_item)) {
				offlinemeter.energy_item_id = offlinemeter.energy_item.id;
			} else {
				offlinemeter.energy_item_id = undefined;
			}
			offlinemeter.cost_center_id = offlinemeter.cost_center.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			OfflineMeterService.addOfflineMeter(offlinemeter, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.OFFLINE_METER")}),
						showCloseButton: true,
					});
					$scope.getAllOfflineMeters();
					$scope.$emit('handleEmitOfflineMeterChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.OFFLINE_METER")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editOfflineMeter = function(offlinemeter) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/meter/offlinemeter.model.html',
			controller: 'ModalEditOfflineMeterCtrl',
			resolve: {
				params: function() {
					return {
						offlinemeter: angular.copy(offlinemeter),
						offlinemeters: angular.copy($scope.offlinemeters),
						categories: angular.copy($scope.categories),
						energyitems: angular.copy($scope.energyitems),
						costcenters: angular.copy($scope.costcenters)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedOfflineMeter) {
			modifiedOfflineMeter.energy_category_id = modifiedOfflineMeter.energy_category.id;
			if (modifiedOfflineMeter.energy_item != null && modifiedOfflineMeter.energy_item.id != null ) {
				modifiedOfflineMeter.energy_item_id = modifiedOfflineMeter.energy_item.id;
			} else {
				modifiedOfflineMeter.energy_item_id = undefined;
			}
			modifiedOfflineMeter.cost_center_id = modifiedOfflineMeter.cost_center.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			OfflineMeterService.editOfflineMeter(modifiedOfflineMeter, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.OFFLINE_METER")}),
						showCloseButton: true,
					});
					$scope.getAllOfflineMeters();
					$scope.$emit('handleEmitOfflineMeterChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.OFFLINE_METER")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
	};

	$scope.deleteOfflineMeter = function(offlinemeter) {
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
					OfflineMeterService.deleteOfflineMeter(offlinemeter, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.OFFLINE_METER")}),
								showCloseButton: true,
							});
							$scope.getAllOfflineMeters();
							$scope.$emit('handleEmitOfflineMeterChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.OFFLINE_METER")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.getAllOfflineMeters();
	$scope.getAllCategories();
	$scope.getAllEnergyItems();
	$scope.getAllCostCenters();
});

app.controller('ModalAddOfflineMeterCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "SETTING.ADD_OFFLINE_METER";
	$scope.categories = params.categories;
	$scope.energyitems = [];
	$scope.costcenters = params.costcenters;
	$scope.offlinemeter = {
		is_counted: false
	};
	$scope.ok = function() {
		$uibModalInstance.close($scope.offlinemeter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.last_energy_category_select_id = null;
	$scope.change_energyitems = function(selected_energy_category_id){
		var i = 0;
		var j = 0;
		$scope.energyitems = [];
		for (; i < params.energyitems.length; i++){
			if (params.energyitems[i]['energy_category']['id'] == selected_energy_category_id){
				$scope.energyitems[j] = params.energyitems[i];
				j = j + 1;
			}
		}

		if ($scope.last_energy_category_select_id == null){
			$scope.last_energy_category_select_id = selected_energy_category_id;
		}
		else{
			if($scope.last_energy_category_select_id != selected_energy_category_id){
				$scope.last_energy_category_select_id = selected_energy_category_id;
				delete $scope.offlinemeter.energy_item;
			}
		}
	}

});

app.controller('ModalEditOfflineMeterCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_OFFLINE_METER";
	$scope.offlinemeter = params.offlinemeter;
	$scope.offlinemeters = params.offlinemeters;
	$scope.categories = params.categories;
	$scope.energyitems = [];
	$scope.costcenters = params.costcenters;

	$scope.ok = function() {
		$uibModalInstance.close($scope.offlinemeter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.last_energy_category_select_id = null;
	$scope.change_energyitems = function(selected_energy_category_id){
		var i = 0;
		var j = 0;
		$scope.energyitems = [];
		for (; i < params.energyitems.length; i++){
			if (params.energyitems[i]['energy_category']['id'] == selected_energy_category_id){
				$scope.energyitems[j] = params.energyitems[i];
				j = j + 1;
			}
		}

		if ($scope.last_energy_category_select_id == null){
			$scope.last_energy_category_select_id = selected_energy_category_id;
		}
		else{
			if($scope.last_energy_category_select_id != selected_energy_category_id){
				$scope.last_energy_category_select_id = selected_energy_category_id;
				delete $scope.offlinemeter.energy_item;
			}
		}
	};
	$scope.change_energyitems($scope.offlinemeter.energy_category.id);
});
