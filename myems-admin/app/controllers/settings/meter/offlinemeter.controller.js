'use strict';

// Offline Meter controller - drag-and-drop meter binding

app.controller('OfflineMeterController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	$timeout,
	OfflineMeterService,
	CategoryService,
	EnergyItemService,
	CostCenterService,
	toaster,
	SweetAlert) {

	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.searchOfflineMeterKeyword = '';
	// Load all cost centers from API
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

	// Load all categories from API
	$scope.getAllCategories = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CategoryService.getAllCategories(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.categories = response.data;
			} else {
				$scope.categories = [];
			}
		});
	};

	// Load all energy items from API
	$scope.getAllEnergyItems = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyItemService.getAllEnergyItems(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energyitems = response.data;
			} else {
				$scope.energyitems = [];
			}
		});
	};

	// Load all offline meters from API
	$scope.getAllOfflineMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		OfflineMeterService.getAllOfflineMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeters = response.data;
			} else {
				$scope.offlinemeters = [];
			}
		});

	};

	// Open add modal and create offline meter
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
		$rootScope.modalInstance = modalInstance;
	};

	// Open edit modal and update offline meter
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
		$rootScope.modalInstance = modalInstance;
	};

	// Confirm and delete offline meter
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

	// Export offline meter as JSON
	$scope.exportOfflineMeter = function(offlinemeter) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		OfflineMeterService.exportOfflineMeter(offlinemeter, headers, function(response) {
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

	// Clone an existing offline meter
	$scope.cloneOfflineMeter = function(offlinemeter){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		OfflineMeterService.cloneOfflineMeter(offlinemeter, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.OFFLINE_METER")}),
					showCloseButton: true,
				});
				$scope.getAllOfflineMeters();
				$scope.$emit('handleEmitOfflineMeterChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.OFFLINE_METER")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	// Import offline meter from JSON
	$scope.importOfflineMeter = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/common/import.html',
			controller: 'ModalImportCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						description: 'SETTING.IMPORT_OFFLINE_METER_DESCRIPTION',
						description_more: 'SETTING.IMPORT_OFFLINE_METER_DESCRIPTION_MORE'
					};
				}
			}
		});
		modalInstance.result.then(function(importdata) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			OfflineMeterService.importOfflineMeter(importdata, headers, function(response) {
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
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("SETTING.OFFLINE_METER") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	let searchDebounceTimer = null;
	function safeApply(scope) {
		if (!scope.$$phase && !scope.$root.$$phase) {
			scope.$apply();
		}
	}
	// Search offline meters by keyword
	$scope.searchOfflineMeters = function() {
		const headers = {
			"User-UUID": $scope.cur_user?.uuid,
			"Token": $scope.cur_user?.token
		};

		const rawKeyword = $scope.searchOfflineMeterKeyword || "";
		const trimmedKeyword = rawKeyword.trim();

		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}

		searchDebounceTimer = setTimeout(() => {
			if (!trimmedKeyword) {
				$scope.getAllOfflineMeters();
				safeApply($scope);
				return;
			}

			OfflineMeterService.searchOfflineMeters(trimmedKeyword, headers, (response) => {
				$scope.offlinemeters = (response.status === 200) ? response.data : [];
				$scope.parentmeters = [...$scope.offlinemeters];
			});
		}, 300);
	};


	$scope.tabInitialized = false;

	// Initialize tab
	$scope.initTab = function() {
		if (!$scope.tabInitialized) {
			$scope.tabInitialized = true;
			$scope.getAllOfflineMeters();
			$scope.getAllCategories();
			$scope.getAllEnergyItems();
			$scope.getAllCostCenters();
		}
	};

	$scope.$on('meter.tabSelected', function(event, tabIndex) {
		if ($scope.$parent && $scope.$parent.TAB_INDEXES && tabIndex === $scope.$parent.TAB_INDEXES.OFFLINE_METER && !$scope.tabInitialized) {
			$scope.initTab();
		}
	});

	$timeout(function() {
		if ($scope.$parent && $scope.$parent.TAB_INDEXES && $scope.$parent.activeTabIndex === $scope.$parent.TAB_INDEXES.OFFLINE_METER && !$scope.tabInitialized) {
			$scope.initTab();
		}
	}, 0);
});

// Modal controller for add dialog
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

// Modal controller for edit dialog
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
