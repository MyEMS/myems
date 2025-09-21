'use strict';

app.controller('MeterController', function($scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MeterService,
	CategoryService,
	CostCenterService,
	EnergyItemService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';
	$scope.searchKeyword = '';

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
	$scope.getAllMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				$scope.parentmeters = response.data;
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

    let searchDebounceTimer = null;

    function safeApply(scope) {
        if (!scope.$$phase && !scope.$root.$$phase) {
            scope.$apply();
        }
    }

    $scope.searchMeters = function() {
        const headers = {
            "User-UUID": $scope.cur_user?.uuid,
            "Token": $scope.cur_user?.token
        };

        const rawKeyword = $scope.searchKeyword || "";
        const trimmedKeyword = rawKeyword.trim();

        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }

        searchDebounceTimer = setTimeout(() => {
            if (!trimmedKeyword) {
                $scope.getAllMeters();
                safeApply($scope);
                return;
            }

            MeterService.searchMeters(trimmedKeyword, headers, (response) => {
                $scope.meters = (response.status === 200) ? response.data : [];
                $scope.parentmeters = [...$scope.meters];

                const treedata = {
                    'core': { 'data': [], "multiple": false },
                    "plugins": ["wholerow"]
                };

                $scope.meters.forEach(meter => {
                    const node = {
                        "id": meter.id.toString(),
                        "text": meter.name
                    };

                    if (!meter.master_meter) {
                        node.parent = '#';
                        node.state = { 'opened': true, 'selected': false };
                    } else {
                        node.parent = meter.master_meter.id.toString();
                    }

                    treedata.core.data.push(node);
                });

                const treeElement = angular.element(metertree);
                const existingTree = treeElement.jstree(true);

                if (existingTree) {
                    existingTree.settings.core.data = treedata.core.data;
                    existingTree.refresh();
                } else {
                    treeElement.jstree(treedata);
                }

                treeElement.off("changed.jstree");
                treeElement.on("changed.jstree", (e, data) => {
                    if (data.selected?.length) {
                        $scope.currentMeterID = parseInt(data.selected[0], 10);
                        $scope.getMeterSubmeters($scope.currentMeterID);
                    } else {
                        $scope.currentMeterID = null;
                        $scope.submeters = [];
                    }
                    safeApply($scope);
                });

                safeApply($scope);
            });
        }, 300);
    };


	$scope.refreshMeterTree = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				$scope.parentmeters = response.data;
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
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getMeterSubmeters(meterid, headers, function (response) {
		if (angular.isDefined(response.status) && response.status === 200) {
			$scope.currentMeterSubmeters = response.data;
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
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
			MeterService.addMeter(meter, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.METER")}),
						showCloseButton: true,
					});
					$scope.getAllMeters();
					$scope.$emit('handleEmitMeterChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.METER")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
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
			MeterService.editMeter(modifiedMeter, headers,function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.METER")}),
						showCloseButton: true,
					});
					$scope.getAllMeters();
					$scope.$emit('handleEmitMeterChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.METER")}),
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

	$scope.deleteMeter = function(meter) {
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
					MeterService.deleteMeter(meter, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.METER")}),
								showCloseButton: true,
							});
							$scope.getAllMeters();
							$scope.$emit('handleEmitMeterChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.METER")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.exportMeter = function(meter) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.exportMeter(meter, headers, function(response) {
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

	$scope.cloneMeter = function(meter){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.cloneMeter(meter, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.METER")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitMeterChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.METER")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importMeter = function() {
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
			MeterService.importMeter(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.METER")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitMeterChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("SETTING.METER") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
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
	$scope.energyitems = [];
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
				delete $scope.meter.energy_item;
			}
		}
	};
});

app.controller('ModalEditMeterCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_METER";
	$scope.meter = params.meter;
	$scope.meters = params.meters;
	$scope.parentmeters = params.parentmeters;
	$scope.categories = params.categories;
	$scope.costcenters = params.costcenters;
	$scope.energyitems = [];
	$scope.ok = function() {
		$uibModalInstance.close($scope.meter);
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
				delete $scope.meter.energy_item;
			}
		}
	};
	$scope.change_energyitems($scope.meter.energy_category.id);
});
