'use strict';

app.controller('VirtualMeterController', function($scope, $common, $uibModal, $translate,	MeterService,	VirtualMeterService,	OfflineMeterService,	CategoryService,	EnergyItemService, CostCenterService,	toaster, SweetAlert) {
	$scope.getAllCostCenters = function() {
		CostCenterService.getAllCostCenters(function(error, data) {
			if (!error) {
				$scope.costcenters = data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllCategories = function() {
		CategoryService.getAllCategories(function(error, data) {
			if (!error) {
				$scope.categories = data;
			} else {
				$scope.categories = [];
			}
		});
	};

$scope.getAllEnergyItems = function() {
	EnergyItemService.getAllEnergyItems(function(error, data) {
		if (!error) {
			$scope.energyitems = data;
		} else {
			$scope.energyitems = [];
		}
	});
};

	$scope.getAllVirtualMeters = function() {
		VirtualMeterService.getAllVirtualMeters(function(error, data) {
			if (!error) {
				$scope.virtualmeters = data;
			} else {
				$scope.virtualmeters = [];
			}
		});

	};
	$scope.getAllMeters = function() {
		MeterService.getAllMeters(function(error, data) {
			if (!error) {
				$scope.meters = data;
			} else {
				$scope.meters = [];
			}
		});
	};

	$scope.getAllOfflineMeters = function() {
		OfflineMeterService.getAllOfflineMeters(function(error, data) {
			if (!error) {
				$scope.offlinemeters = data;
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
			VirtualMeterService.addVirtualMeter(virtualmeter, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "SETTING.VIRTUAL_METER";
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
					$scope.getAllVirtualMeters();
					$scope.$emit('handleEmitVirtualMeterChanged');
				} else {
					var templateName = "SETTING.VIRTUAL_METER";
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
			VirtualMeterService.editVirtualMeter(modifiedVirtualMeter, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "SETTING.VIRTUAL_METER";
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
					$scope.getAllVirtualMeters();
					$scope.$emit('handleEmitVirtualMeterChanged');
				} else {
					var templateName = "SETTING.VIRTUAL_METER";
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

	$scope.deleteVirtualMeter = function(virtualmeter) {
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
					VirtualMeterService.deleteVirtualMeter(virtualmeter, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "SETTING.VIRTUAL_METER";
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
							$scope.getAllVirtualMeters();
							$scope.$emit('handleEmitVirtualMeterChanged');
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
							var templateName = "SETTING.VIRTUAL_METER";
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
	$scope.energyitems = params.energyitems;
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
	};

});
