'use strict';

app.controller('VirtualMeterController', function($scope, $window, $uibModal, $translate,
	MeterService,
	VirtualMeterService,
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

	$scope.getAllVirtualMeters = function() {
		VirtualMeterService.getAllVirtualMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.virtualmeters = response.data;
			} else {
				$scope.virtualmeters = [];
			}
		});

	};
	$scope.getAllMeters = function() {
		MeterService.getAllMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
			} else {
				$scope.meters = [];
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

	$scope.addVirtualMeter = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/meter/virtualmeter.model.html',
			controller: 'ModalAddVirtualMeterCtrl',
			windowClass: 'animated fadeIn',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						virtualmeters: angular.copy($scope.virtualmeters),
						meters: angular.copy($scope.meters),
						offlinemeters: angular.copy($scope.offlinemeters),
						categories: angular.copy($scope.categories),
						energyitems: angular.copy($scope.energyitems),
						costcenters: angular.copy($scope.costcenters)
					};
				}
			}
		});
		modalInstance.result.then(function(virtualmeter) {
			virtualmeter.energy_category_id = virtualmeter.energy_category.id;
			if(angular.isDefined(virtualmeter.energy_item)) {
				virtualmeter.energy_item_id = virtualmeter.energy_item.id;
			} else {
				virtualmeter.energy_item_id = undefined;
			}
			virtualmeter.cost_center_id = virtualmeter.cost_center.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			VirtualMeterService.addVirtualMeter(virtualmeter, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.VIRTUAL_METER")}),
						showCloseButton: true,
					});
					$scope.getAllVirtualMeters();
					$scope.$emit('handleEmitVirtualMeterChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.VIRTUAL_METER")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editVirtualMeter = function(virtualmeter) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/meter/virtualmeter.model.html',
			controller: 'ModalEditVirtualMeterCtrl',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						virtualmeter: angular.copy(virtualmeter),
						virtualmeters: angular.copy($scope.virtualmeters),
						meters: angular.copy($scope.meters),
						offlinemeters: angular.copy($scope.offlinemeters),
						categories: angular.copy($scope.categories),
						energyitems: angular.copy($scope.energyitems),
						costcenters: angular.copy($scope.costcenters)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedVirtualMeter) {
			modifiedVirtualMeter.energy_category_id = modifiedVirtualMeter.energy_category.id;
			if (modifiedVirtualMeter.energy_item != null && modifiedVirtualMeter.energy_item.id != null ) {
				modifiedVirtualMeter.energy_item_id = modifiedVirtualMeter.energy_item.id;
			} else {
				modifiedVirtualMeter.energy_item_id = undefined;
			}
			modifiedVirtualMeter.cost_center_id = modifiedVirtualMeter.cost_center.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			VirtualMeterService.editVirtualMeter(modifiedVirtualMeter, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.VIRTUAL_METER")}),
						showCloseButton: true,
					});
					$scope.getAllVirtualMeters();
					$scope.$emit('handleEmitVirtualMeterChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.VIRTUAL_METER")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
	};

	$scope.deleteVirtualMeter = function(virtualmeter) {
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
					VirtualMeterService.deleteVirtualMeter(virtualmeter, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.VIRTUAL_METER")}),
								showCloseButton: true,
							});
							$scope.getAllVirtualMeters();
							$scope.$emit('handleEmitVirtualMeterChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.VIRTUAL_METER")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.getAllMeters();
	$scope.getAllVirtualMeters();
	$scope.getAllOfflineMeters();
	$scope.getAllCategories();
	$scope.getAllEnergyItems();
	$scope.getAllCostCenters();

	$scope.$on('handleBroadcastMeterChanged', function(event) {
		$scope.getAllMeters();
	});

	$scope.$on('handleBroadcastOfflineMeterChanged', function(event) {
		$scope.getAllOfflineMeters();
	});

	$scope.$on('handleBroadcastVirtualMeterChanged', function(event) {
		$scope.getAllVirtualMeters();
	});

});

app.controller('ModalAddVirtualMeterCtrl', function($timeout, $scope,
	$uibModalInstance,
	params) {

	$scope.operation = "SETTING.ADD_VIRTUAL_METER";
	$scope.categories = params.categories;
	$scope.energyitems = [];
	$scope.costcenters = params.costcenters;
	$scope.meters = params.meters;
	$scope.virtualmeters = params.virtualmeters;
	$scope.offlinemeters = params.offlinemeters;
	$scope.currentMeterType = {};
	$scope.currentMeter = {};
	$scope.virtualmeter = {
		is_counted: false,
		expression: {
			variables: []
		}
	};
	$scope.metertypes = [{
		sid: 'meter',
		name: 'SETTING.METER'
	}, {
		sid: 'virtual_meter',
		name: 'SETTING.VIRTUAL_METER'
	}, {
		sid: 'offline_meter',
		name: 'SETTING.OFFLINE_METER'
	}];
	$scope.metertypemap = {
		meter: 'SETTING.METER',
		virtual_meter: 'SETTING.VIRTUAL_METER',
		offline_meter: 'SETTING.OFFLINE_METER'
	};
	$scope.counter = 1;
	$scope.ok = function() {
		$uibModalInstance.close($scope.virtualmeter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};


	$scope.last_energy_category_select_id = null;
	$scope.change_energyitems = function(selected_energy_category_id) {
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
				delete $scope.virtualmeter.energy_item;
			}
		}
	};

	$scope.add = function() {
		var variable = {
			name: 'x' + ($scope.counter),
			meter_type: $scope.currentMeterType.selected.sid,
			meter_id: $scope.currentMeter.selected.id,
			//metertype:$scope.currentMeterType.selected.name,
			meter_name: $scope.currentMeter.selected.name
		}
		if ($scope.virtualmeter.expression.variables.length > 0) {
			$scope.virtualmeter.expression.variables.unshift(variable);
		} else {
			$scope.virtualmeter.expression.variables.push(variable);
		}

		$timeout(function() {
			angular.element('#variablesTable').trigger('footable_redraw');
		}, 10);

		$scope.counter++;
		$scope.currentMeter.selected=undefined;

	};
	$scope.delete = function(key) {
		$scope.virtualmeter.expression.variables.splice(key, 1);
		$timeout(function() {
			angular.element('#variablesTable').trigger('footable_redraw');
		}, 10);

	};

	$scope.last_meter_type_select = null;
	$scope.changeMeterType = function() {
		switch ($scope.currentMeterType.selected.sid) {
			case 'meter':
				$scope.currentmeters = $scope.meters;
				break;
			case 'virtual_meter':
				$scope.currentmeters = $scope.virtualmeters;
				break;
			case 'offline_meter':
				$scope.currentmeters = $scope.offlinemeters;
				break;
		}

		if ($scope.last_meter_type_select == null){
			$scope.last_meter_type_select = $scope.currentMeterType.selected.sid;
		}
		else{
			if($scope.last_meter_type_select != $scope.currentMeterType.selected.sid){
				$scope.last_meter_type_select = $scope.currentMeterType.selected.sid;
				delete $scope.currentMeter.selected;
			}
		}
	};
});

app.controller('ModalEditVirtualMeterCtrl', function($timeout, $scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_VIRTUAL_METER";
	$scope.virtualmeter = params.virtualmeter;
	$scope.virtualmeters = params.virtualmeters;
	$scope.meters = params.meters;
	$scope.offlinemeters = params.offlinemeters;
	$scope.categories = params.categories;
	$scope.energyitems = params.energyitems;
	$scope.costcenters = params.costcenters;
	$scope.currentMeterType = {};
	$scope.currentMeter = {};
	$scope.metertypes = [{
		sid: 'meter',
		name: 'SETTING.METER'
	}, {
		sid: 'virtual_meter',
		name: 'SETTING.VIRTUAL_METER'
	}, {
		sid: 'offline_meter',
		name: 'SETTING.OFFLINE_METER'
	}];
	$scope.metertypemap = {
		meter: 'SETTING.METER',
		virtual_meter: 'SETTING.VIRTUAL_METER',
		offline_meter: 'SETTING.OFFLINE_METER'
	};
	$scope.counter = 1;
	if (angular.isUndefined($scope.virtualmeter.expression.variables)) {
		$scope.virtualmeter.expression.variables = [];
	} else {
		if ($scope.virtualmeter.expression.variables.length > 0) {
			var arrIndex = [];
			angular.forEach($scope.virtualmeter.expression.variables, function(item, index) {
				arrIndex.push(parseInt(item.name.substr(1)));
			});
			var maxval = Math.max.apply(null, arrIndex);
			$scope.counter = maxval + 1;
		}
	}
	$scope.ok = function() {
		$uibModalInstance.close($scope.virtualmeter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.last_energy_category_select_id = null;
	$scope.change_energyitems = function(selected_energy_category_id) {
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
				delete $scope.virtualmeter.energy_item;
			}
		}
	};

	$scope.change_energyitems($scope.virtualmeter.energy_category.id);

	$timeout(function() {
		angular.element('#variablesTable').trigger('footable_redraw');
	}, 100);

	$scope.add = function() {
		var variable = {
			name: 'x' + ($scope.counter),
			meter_type: $scope.currentMeterType.selected.sid,
			meter_id: $scope.currentMeter.selected.id,
			//metertype:$scope.currentMeterType.selected.name,
			meter_name: $scope.currentMeter.selected.name
		}
		if ($scope.virtualmeter.expression.variables.length > 0) {
			$scope.virtualmeter.expression.variables.unshift(variable);
		} else {
			$scope.virtualmeter.expression.variables.push(variable);
		}

		$timeout(function() {
			angular.element('#variablesTable').trigger('footable_redraw');
		}, 10);
		$scope.counter++;
		$scope.currentMeter.selected=undefined;

	};
	$scope.delete = function(key) {
		$scope.virtualmeter.expression.variables.splice(key, 1);
		$timeout(function() {
			angular.element('#variablesTable').trigger('footable_redraw');
		}, 10);

	};

	$scope.last_meter_type_select = null;
	$scope.changeMeterType = function() {
		switch ($scope.currentMeterType.selected.sid) {
			case 'meter':
				$scope.currentmeters = $scope.meters;
				break;
			case 'virtual_meter':
				$scope.currentmeters = $scope.virtualmeters;
				break;
			case 'offline_meter':
				$scope.currentmeters = $scope.offlinemeters;
				break;
		}
	
		if ($scope.last_meter_type_select == null){
			$scope.last_meter_type_select = $scope.currentMeterType.selected.sid;
		}
		else{
			if($scope.last_meter_type_select != $scope.currentMeterType.selected.sid){
				$scope.last_meter_type_select = $scope.currentMeterType.selected.sid;
				delete $scope.currentMeter.selected;
			}
		}
	};

});
