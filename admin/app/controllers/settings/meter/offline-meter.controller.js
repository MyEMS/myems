'use strict';

app.controller('OfflineMeterController', function($scope, $common, $translate, $uibModal, OfflineMeterService, CategoryService, EnergyItemService, CostCenterService, toaster, SweetAlert) {
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

	$scope.getAllOfflineMeters = function() {
		OfflineMeterService.getAllOfflineMeters(function(error, data) {
			if (!error) {
				$scope.offlinemeters = data;
			} else {
				$scope.offlinemeters = [];
			}
		});

	};

	$scope.addOfflineMeter = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/meter/offline-meter.model.html',
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
			OfflineMeterService.addOfflineMeter(offlinemeter, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "SETTING.OFFLINE_METER";
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

					$scope.getAllOfflineMeters();
					$scope.$emit('handleEmitOfflineMeterChanged');
				} else {
					var templateName = "SETTING.OFFLINE_METER";
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

	$scope.editOfflineMeter = function(offlinemeter) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/meter/offline-meter.model.html',
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
			OfflineMeterService.editOfflineMeter(modifiedOfflineMeter, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "SETTING.OFFLINE_METER";
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
					$scope.getAllOfflineMeters();
					$scope.$emit('handleEmitOfflineMeterChanged');
				} else {
					var templateName = "SETTING.OFFLINE_METER";
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

	$scope.deleteOfflineMeter = function(offlinemeter) {
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
					OfflineMeterService.deleteOfflineMeter(offlinemeter, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "SETTING.OFFLINE_METER";
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
							$scope.getAllOfflineMeters();
							$scope.$emit('handleEmitOfflineMeterChanged');
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
							var templateName = "SETTING.OFFLINE_METER";
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

	$scope.getAllOfflineMeters();
	$scope.getAllCategories();
	$scope.getAllEnergyItems();
	$scope.getAllCostCenters();
});

app.controller('ModalAddOfflineMeterCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "SETTING.ADD_OFFLINE_METER";
	$scope.categories = params.categories;
	$scope.energyitems = params.energyitems;
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
});

app.controller('ModalEditOfflineMeterCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_OFFLINE_METER";
	$scope.offlinemeter = params.offlinemeter;
	$scope.offlinemeters = params.offlinemeters;
	$scope.categories = params.categories;
	$scope.energyitems = params.energyitems;
	$scope.costcenters = params.costcenters;

	$scope.ok = function() {
		$uibModalInstance.close($scope.offlinemeter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
