'use strict';

app.controller('MeterController', function($scope,  $translate,$common, $uibModal, MeterService, CategoryService, CostCenterService, EnergyItemService,toaster, SweetAlert) {

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
	$scope.getAllMeters = function() {
		MeterService.getAllMeters(function(error, data) {
			if (!error) {
				$scope.meters = data;
				$scope.parentmeters = data;
			} else {
				$scope.meters = [];
				$scope.parentmeters = [];
			}
			//create meter tree
			var treedata = {'core': {'data': [], "multiple" : false,}, "plugins" : [ "wholerow" ]};
			for(var i=0; i < $scope.meters.length; i++) {
					if ($scope.meters[i].master_meter == null) {
						var node = {"id": $scope.meters[i].id.toString(),
																"parent": '#',
																"text": $scope.meters[i].name,
																"state": {  'opened' : true,  'selected' : false },
															 };
					} else {
							var node = {"id": $scope.meters[i].id.toString(),
																	"parent": $scope.meters[i].master_meter.id.toString(),
																	"text": $scope.meters[i].name,
																 };
					};
					treedata['core']['data'].push(node);
			}

			angular.element(metertree).jstree(treedata);
			//meter tree selected changed event handler
			angular.element(metertree).on("changed.jstree", function (e, data) {
				$scope.currentMeterID = parseInt(data.selected[0]);
				$scope.getMeterSubmeters($scope.currentMeterID);
			});
		});

	};

	$scope.refreshMeterTree = function() {
		MeterService.getAllMeters(function(error, data) {
			if (!error) {
				$scope.meters = data;
				$scope.parentmeters = data;
			} else {
				$scope.meters = [];
				$scope.parentmeters = [];
			}
			//create meter tree
			var treedata = {'core': {'data': [], "multiple" : false,}, "plugins" : [ "wholerow" ]};
			for(var i=0; i < $scope.meters.length; i++) {
				if ($scope.meters[i].master_meter == null) {
					var node = {"id": $scope.meters[i].id.toString(),
								"parent": '#',
								"text": $scope.meters[i].name,
								"state": {  'opened' : true,  'selected' : false },
								};
				} else {
					var node = {"id": $scope.meters[i].id.toString(),
								"parent": $scope.meters[i].master_meter.id.toString(),
								"text": $scope.meters[i].name,
								};
				};
				treedata['core']['data'].push(node);
			}
			var metertree = document.getElementById("metertree");
			angular.element(metertree).jstree(true).settings.core.data = treedata['core']['data'];
			angular.element(metertree).jstree(true).refresh();
		});
	};

	$scope.getMeterSubmeters = function(meterid) {
		MeterService.getMeterSubmeters(meterid, function(error, data) {
		if (!error) {
			$scope.currentMeterSubmeters = data;
		} else {
			$scope.currentMeterSubmeters = [];
		}
		});
	};

	$scope.addMeter = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/meter/meter.model.html',
			controller: 'ModalAddMeterCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						meters: angular.copy($scope.meters),
						parentmeters: angular.copy($scope.parentmeters),
						categories: angular.copy($scope.categories),
						costcenters: angular.copy($scope.costcenters),
						energyitems: angular.copy($scope.energyitems),
					};
				}
			}
		});
		modalInstance.result.then(function(meter) {
			meter.energy_category_id = meter.energy_category.id;
			meter.cost_center_id = meter.cost_center.id;
			if(angular.isDefined(meter.energy_item)) {
				meter.energy_item_id = meter.energy_item.id;
			} else {
				meter.energy_item_id = undefined;
			}
			if(angular.isDefined(meter.master_meter)) {
				meter.master_meter_id = meter.master_meter.id;
			} else {
				meter.master_meter_id = undefined;
			}
			MeterService.addMeter(meter, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "SETTING.METER";
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
					$scope.getAllMeters();
					$scope.$emit('handleEmitMeterChanged');
				} else {
					var templateName = "SETTING.METER";
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

	$scope.editMeter = function(meter) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/meter/meter.model.html',
			controller: 'ModalEditMeterCtrl',
			resolve: {
				params: function() {
					return {
						meter: angular.copy(meter),
						meters: angular.copy($scope.meters),
						parentmeters: angular.copy($scope.parentmeters),
						categories: angular.copy($scope.categories),
						costcenters: angular.copy($scope.costcenters),
						energyitems: angular.copy($scope.energyitems),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedMeter) {
			modifiedMeter.energy_category_id = modifiedMeter.energy_category.id;
			modifiedMeter.cost_center_id = modifiedMeter.cost_center.id;
			if (modifiedMeter.energy_item != null && modifiedMeter.energy_item.id != null ) {
				modifiedMeter.energy_item_id = modifiedMeter.energy_item.id;
			} else {
				modifiedMeter.energy_item_id = undefined;
			}
			if (modifiedMeter.master_meter != null && modifiedMeter.master_meter.id != null ) {
				modifiedMeter.master_meter_id = modifiedMeter.master_meter.id;
			} else {
				modifiedMeter.master_meter_id = undefined;
			}
			MeterService.editMeter(modifiedMeter, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "SETTING.METER";
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
					$scope.getAllMeters();
					$scope.$emit('handleEmitMeterChanged');
				} else {
					var templateName = "SETTING.METER";
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

	$scope.deleteMeter = function(meter) {
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
					MeterService.deleteMeter(meter, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "SETTING.METER";
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
							$scope.getAllMeters();
							$scope.$emit('handleEmitMeterChanged');
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
							var templateName = "SETTING.METER";
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
	$scope.getAllCategories();
	$scope.getAllCostCenters();
    $scope.getAllEnergyItems();

	$scope.$on('handleBroadcastMeterChanged', function(event) {
		$scope.refreshMeterTree();
	});

});

app.controller('ModalAddMeterCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "SETTING.ADD_METER";
	$scope.categories = params.categories;
	$scope.costcenters = params.costcenters;
	$scope.energyitems = params.energyitems;
	$scope.parentmeters = params.parentmeters;
	$scope.meter = {
		is_counted: false
	};
	$scope.ok = function() {
		$uibModalInstance.close($scope.meter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditMeterCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_METER";
	$scope.meter = params.meter;
	$scope.meters = params.meters;
	$scope.parentmeters = params.parentmeters;
	$scope.categories = params.categories;
	$scope.costcenters = params.costcenters;
	$scope.energyitems = params.energyitems;
	$scope.ok = function() {
		$uibModalInstance.close($scope.meter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
