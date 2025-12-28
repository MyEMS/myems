'use strict';

app.controller('CombinedEquipmentParameterController', function (
    $scope,
    $rootScope,
    $window,
    $uibModal,
    $translate,
    MeterService,
    VirtualMeterService,
    OfflineMeterService,
    CombinedEquipmentParameterService,
    CombinedEquipmentService,
    CombinedEquipmentDataSourceService,
    toaster,
    SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.currentCombinedEquipment = { selected: undefined };
	$scope.is_show_add_parameter = false;
	$scope.combinedequipments = [];
	$scope.meters = [];
	$scope.offlinemeters = [];
	$scope.virtualmeters = [];
	$scope.mergedMeters = [];

	$scope.getAllCombinedEquipments = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CombinedEquipmentService.getAllCombinedEquipments(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.combinedequipments = response.data;
			} else {
				$scope.combinedequipments = [];
			}
		});
	};

	$scope.changeCombinedEquipment = function (item, model) {
		$scope.currentCombinedEquipment = item;
		$scope.currentCombinedEquipment.selected = model;
		$scope.is_show_add_parameter = true;
		$scope.getParametersByCombinedEquipmentID($scope.currentCombinedEquipment.id, true);
	};

	$scope.getParametersByCombinedEquipmentID = function (id, shouldGetPoints) {
		$scope.combinedequipmentparameters = [];
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CombinedEquipmentParameterService.getParametersByCombinedEquipmentID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.combinedequipmentparameters = response.data;
			}
			if (shouldGetPoints) {
				$scope.getPointsByCombinedEquipmentID(id, false);
			}
		});
	};

	$scope.addCombinedEquipmentParameter = function () {
		if (!$scope.currentCombinedEquipment || !$scope.currentCombinedEquipment.id) {
			return;
		}
		$scope.getPointsByCombinedEquipmentID($scope.currentCombinedEquipment.id, false, function() {
			var modalInstance = $uibModal.open({
				templateUrl: 'views/settings/combinedequipment/combinedequipmentparameter.model.html',
				controller: 'ModalAddCombinedEquipmentParameterCtrl',
				windowClass: "animated fadeIn",
				resolve: {
					params: function () {
						return {
							points: angular.copy($scope.points || []),
							mergedmeters: angular.copy($scope.mergedmeters || []),
						};
					}
				}
			});
			modalInstance.result.then(function (combinedequipmentparameter) {
				var combinedequipmentid = $scope.currentCombinedEquipment.id;
				if (combinedequipmentparameter.point != null && combinedequipmentparameter.point.id != null) {
					combinedequipmentparameter.point_id = combinedequipmentparameter.point.id;
				}
				if (combinedequipmentparameter.numerator_meter != null) {
					combinedequipmentparameter.numerator_meter_uuid = combinedequipmentparameter.numerator_meter.uuid;
				}
				if (combinedequipmentparameter.denominator_meter != null) {
					combinedequipmentparameter.denominator_meter_uuid = combinedequipmentparameter.denominator_meter.uuid;
				}
				let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
				CombinedEquipmentParameterService.addCombinedEquipmentParameter(combinedequipmentid, combinedequipmentparameter, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 201) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("COMBINED_EQUIPMENT.PARAMETER") }),
							showCloseButton: true,
						});
						$scope.getParametersByCombinedEquipmentID($scope.currentCombinedEquipment.id, true);
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMBINED_EQUIPMENT.PARAMETER") }),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}, function () {

			});
			$rootScope.modalInstance = modalInstance;
		});
	};

	$scope.editCombinedEquipmentParameter = function (combinedequipmentparameter) {
		if (!$scope.currentCombinedEquipment || !$scope.currentCombinedEquipment.id) {
			return;
		}
		$scope.getPointsByCombinedEquipmentID($scope.currentCombinedEquipment.id, true, function() {
			var modalInstance = $uibModal.open({
				templateUrl: 'views/settings/combinedequipment/combinedequipmentparameter.model.html',
				controller: 'ModalEditCombinedEquipmentParameterCtrl',
				windowClass: "animated fadeIn",
				resolve: {
					params: function () {
						return {
							combinedequipmentparameter: angular.copy(combinedequipmentparameter),
							points: angular.copy($scope.points || []),
							mergedmeters: angular.copy($scope.mergedmeters || []),
						};
					}
				}
			});

			modalInstance.result.then(function (modifiedCombinedEquipmentParameter) {
				if (modifiedCombinedEquipmentParameter.point != null && modifiedCombinedEquipmentParameter.point.id != null) {
					modifiedCombinedEquipmentParameter.point_id = modifiedCombinedEquipmentParameter.point.id;
				}
				if (modifiedCombinedEquipmentParameter.numerator_meter != null) {
					modifiedCombinedEquipmentParameter.numerator_meter_uuid = modifiedCombinedEquipmentParameter.numerator_meter.uuid;
				}
				if (modifiedCombinedEquipmentParameter.denominator_meter != null) {
					modifiedCombinedEquipmentParameter.denominator_meter_uuid = modifiedCombinedEquipmentParameter.denominator_meter.uuid;
				}
				let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
				CombinedEquipmentParameterService.editCombinedEquipmentParameter($scope.currentCombinedEquipment.id, modifiedCombinedEquipmentParameter, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 200) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("COMBINED_EQUIPMENT.PARAMETER") }),
							showCloseButton: true,
						});
						$scope.getParametersByCombinedEquipmentID($scope.currentCombinedEquipment.id, true);
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("COMBINED_EQUIPMENT.PARAMETER") }),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}, function () {
			});
			$rootScope.modalInstance = modalInstance;
		});
	};

	$scope.deleteCombinedEquipmentParameter = function (combinedequipmentparameter) {
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
			function (isConfirm) {
				if (isConfirm) {
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
					CombinedEquipmentParameterService.deleteCombinedEquipmentParameter($scope.currentCombinedEquipment.id, combinedequipmentparameter.id, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("COMBINED_EQUIPMENT.PARAMETER") }),
								showCloseButton: true,
							});
							$scope.getParametersByCombinedEquipmentID($scope.currentCombinedEquipment.id, true);
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("COMBINED_EQUIPMENT.PARAMETER") }),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.colorMeterType = function (type) {
		if (type == 'meters') {
			return 'btn-primary'
		} else if (type == 'virtualmeters') {
			return 'btn-info'
		} else {
			return 'btn-success'
		}
	};

	$scope.showCombinedEquipmentParameterType = function (type) {
		if (type == 'constant') {
			return 'COMBINED_EQUIPMENT.CONSTANT';
		} else if (type == 'point') {
			return 'COMBINED_EQUIPMENT.POINT';
		} else if (type == 'fraction') {
			return 'COMBINED_EQUIPMENT.FRACTION';
		}
	};

	$scope.showCombinedEquipmentParameterNumerator = function (combinedequipmentparameter) {
		if (combinedequipmentparameter.numerator_meter == null) {
			return '-';
		} else {
			return '(' + combinedequipmentparameter.numerator_meter.type + ')' + combinedequipmentparameter.numerator_meter.name;
		}
	};


	$scope.showCombinedEquipmentParameterDenominator = function (combinedequipmentparameter) {
		if (combinedequipmentparameter.denominator_meter == null) {
			return '-';
		} else {
			return '(' + combinedequipmentparameter.denominator_meter.type + ')' + combinedequipmentparameter.denominator_meter.name;
		}
	};

	$scope.getMergedMeters = function () {
		$scope.mergedmeters = [];
		$scope.meters = [];
		$scope.offlinemeters = [];
		$scope.virtualmeters = [];
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				for (var i = 0; i < $scope.meters.length; i++) {
					var mergedmeter = { "uuid": $scope.meters[i].uuid, "name": "meter/" + $scope.meters[i].name };
					$scope.mergedmeters.push(mergedmeter);
				}
			} else {
				$scope.meters = [];
			}
		});

		OfflineMeterService.getAllOfflineMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeters = response.data;
				for (var i = 0; i < $scope.offlinemeters.length; i++) {
					var mergedmeter = { "uuid": $scope.offlinemeters[i].uuid, "name": "offlinemeter/" + $scope.offlinemeters[i].name };
					$scope.mergedmeters.push(mergedmeter);
				}
			} else {
				$scope.offlinemeters = [];
			}
		});

		VirtualMeterService.getAllVirtualMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.virtualmeters = response.data;
				for (var i = 0; i < $scope.virtualmeters.length; i++) {
					var mergedmeter = { "uuid": $scope.virtualmeters[i].uuid, "name": "virtualmeter/" + $scope.virtualmeters[i].name };
					$scope.mergedmeters.push(mergedmeter);
				}
			} else {
				$scope.virtualmeters = [];
			}
		});
	};

	$scope.getBoundPointsFromParameters = function () {
		var boundPoints = [];
		if (angular.isDefined($scope.combinedequipmentparameters) && $scope.combinedequipmentparameters.length > 0) {
			for (var i = 0; i < $scope.combinedequipmentparameters.length; i++) {
				var param = $scope.combinedequipmentparameters[i];
				if (param.parameter_type === 'point' && param.point != null && param.point.id != null) {
					var exists = false;
					for (var j = 0; j < boundPoints.length; j++) {
						if (boundPoints[j].id === param.point.id) {
							exists = true;
							break;
						}
					}
					if (!exists) {
						boundPoints.push(param.point);
					}
				}
			}
		}
		return boundPoints;
	};

	$scope.getPointsByCombinedEquipmentID = function (id, shouldGetBoundPoints, callback) {
		if (!id) {
			if (callback) callback();
			return;
		}
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CombinedEquipmentDataSourceService.getDataSourcePointsByCombinedEquipmentID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200 && response.data.length > 0) {
				var dataSourcePoints = response.data;
				if (shouldGetBoundPoints) {
					var boundPoints = $scope.getBoundPointsFromParameters();
					var mergedPoints = angular.copy(dataSourcePoints);
					var dataSourcePointIds = {};
					for (var i = 0; i < dataSourcePoints.length; i++) {
						dataSourcePointIds[dataSourcePoints[i].id] = true;
					}
					for (var j = 0; j < boundPoints.length; j++) {
						if (!dataSourcePointIds[boundPoints[j].id]) {
							mergedPoints.push(boundPoints[j]);
						}
					}
					$scope.points = mergedPoints;
				} else {
					$scope.points = dataSourcePoints;
				}
			} else {
				if (shouldGetBoundPoints) {
					var boundPoints = $scope.getBoundPointsFromParameters();
					$scope.points = boundPoints;
				} else {
					$scope.points = [];
				}
			}
			if (callback) callback();
		});
	};

	$scope.tabInitialized = false;

	$scope.initTab = function() {
		if (!$scope.tabInitialized) {
			$scope.tabInitialized = true;
			$scope.getAllCombinedEquipments();
			$scope.getMergedMeters();
		}
	};

	$scope.$on('combinedequipment.tabSelected', function(event, tabIndex) {
		var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { BIND_PARAMETER: 4 };
		if (tabIndex === TAB_INDEXES.BIND_PARAMETER && !$scope.tabInitialized) {
			$scope.initTab();
		}
	});

	$timeout(function() {
		var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { BIND_PARAMETER: 4 };
		if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_PARAMETER && !$scope.tabInitialized) {
			$scope.initTab();
		}
	}, 0);

	$scope.$on('handleBroadcastCombinedEquipmentChanged', function (event) {
		if ($scope.tabInitialized) {
			$scope.getAllCombinedEquipments();
		}
	});

	$scope.$on('handleBroadcastCombinedEquipmentDataSourceChanged', function (event, data) {
		if ($scope.tabInitialized && $scope.currentCombinedEquipment && $scope.currentCombinedEquipment.id) {
			if (!data || !data.combinedEquipmentId || data.combinedEquipmentId === $scope.currentCombinedEquipment.id) {
				$scope.getPointsByCombinedEquipmentID($scope.currentCombinedEquipment.id, false);
			}
		}
	});
});


app.controller('ModalAddCombinedEquipmentParameterCtrl', function ($scope, $uibModalInstance, params) {

	$scope.operation = "COMBINED_EQUIPMENT.ADD_PARAMETER";
	$scope.combinedequipmentparameter = {
		parameter_type: "constant",
		point: {}
	};
	$scope.is_disabled = false;
	$scope.points = params.points;
	$scope.mergedmeters = params.mergedmeters;
	$scope.ok = function () {
		if ($scope.combinedequipmentparameter.parameter_type === 'point' && $scope.combinedequipmentparameter.point.id != null) {
			for (var i = 0; i < $scope.points.length; i++) {
				if ($scope.points[i].id === $scope.combinedequipmentparameter.point.id) {
					$scope.combinedequipmentparameter.point = $scope.points[i];
					break;
				}
			}
		}
		$uibModalInstance.close($scope.combinedequipmentparameter);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditCombinedEquipmentParameterCtrl', function ($scope, $uibModalInstance, params) {
	$scope.operation = "COMBINED_EQUIPMENT.EDIT_PARAMETER";
	$scope.combinedequipmentparameter = params.combinedequipmentparameter;
	$scope.points = params.points;
	$scope.mergedmeters = params.mergedmeters;
	$scope.is_disabled = true;
	
	if ($scope.combinedequipmentparameter.parameter_type === 'point' && 
		$scope.combinedequipmentparameter.point != null && 
		$scope.combinedequipmentparameter.point.id != null) {
		var pointFound = false;
		for (var i = 0; i < $scope.points.length; i++) {
			if ($scope.points[i].id === $scope.combinedequipmentparameter.point.id) {
				pointFound = true;
				break;
			}
		}
		if (!pointFound && $scope.combinedequipmentparameter.point.id) {
			$scope.points.push({
				id: $scope.combinedequipmentparameter.point.id,
				name: $scope.combinedequipmentparameter.point.name
			});
		}
	}
	
	$scope.ok = function () {
		$uibModalInstance.close($scope.combinedequipmentparameter);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
