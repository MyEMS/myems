'use strict';

app.controller('CombinedEquipmentParameterController', function ($scope, $common, $timeout, $uibModal, $translate, MeterService, VirtualMeterService, OfflineMeterService, CombinedEquipmentParameterService, CombinedEquipmentService, PointService, toaster, SweetAlert) {
	$scope.currentCombinedEquipment = { selected: undefined };
	$scope.is_show_add_parameter = false;
	$scope.combinedequipments = [];
	$scope.meters = [];
	$scope.offlinemeters = [];
	$scope.virtualmeters = [];
	$scope.mergedMeters = [];

	$scope.getAllCombinedEquipments = function () {
		CombinedEquipmentService.getAllCombinedEquipments(function (error, data) {
			if (!error) {
				$scope.combinedequipments = data;
			} else {
				$scope.combinedequipments = [];
			}
		});
	};

	$scope.changeCombinedEquipment = function (item, model) {
		$scope.currentCombinedEquipment = item;
		$scope.currentCombinedEquipment.selected = model;
		$scope.is_show_add_parameter = true;
		$scope.getParametersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
	};

	$scope.getParametersByCombinedEquipmentID = function (id) {
		$scope.combinedequipmentparameters = [];
		CombinedEquipmentParameterService.getParametersByCombinedEquipmentID(id, function (error, data) {
			if (!error) {
				$scope.combinedequipmentparameters = data;
			}
		});
	};

	$scope.addCombinedEquipmentParameter = function () {

		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/combinedequipment/combinedequipmentparameter.model.html',
			controller: 'ModalAddCombinedEquipmentParameterCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function () {
					return {
						points: angular.copy($scope.points),
						mergedmeters: angular.copy($scope.mergedmeters),
					};
				}
			}
		});
		modalInstance.result.then(function (combinedequipmentparameter) {
			var combinedequipmentid = $scope.currentCombinedEquipment.id;
			if (combinedequipmentparameter.point != null) {
				combinedequipmentparameter.point_id = combinedequipmentparameter.point.id;
			}
			if (combinedequipmentparameter.numerator_meter != null) {
				combinedequipmentparameter.numerator_meter_uuid = combinedequipmentparameter.numerator_meter.uuid;
			}
			if (combinedequipmentparameter.denominator_meter != null) {
				combinedequipmentparameter.denominator_meter_uuid = combinedequipmentparameter.denominator_meter.uuid;
			}

			CombinedEquipmentParameterService.addCombinedEquipmentParameter(combinedequipmentid, combinedequipmentparameter, function (error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "COMBINED_EQUIPMENT.PARAMETER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getParametersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
				} else {
					var templateName = "COMBINED_EQUIPMENT.PARAMETER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
				}
			});
		}, function () {

		});
	};

	$scope.editCombinedEquipmentParameter = function (combinedequipmentparameter) {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/combinedequipment/combinedequipmentparameter.model.html',
			controller: 'ModalEditCombinedEquipmentParameterCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function () {
					return {
						combinedequipmentparameter: angular.copy(combinedequipmentparameter),
						points: angular.copy($scope.points),
						mergedmeters: angular.copy($scope.mergedmeters),
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedCombinedEquipmentParameter) {
			if (modifiedCombinedEquipmentParameter.point != null) {
				modifiedCombinedEquipmentParameter.point_id = modifiedCombinedEquipmentParameter.point.id;
			}
			if (modifiedCombinedEquipmentParameter.numerator_meter != null) {
				modifiedCombinedEquipmentParameter.numerator_meter_uuid = modifiedCombinedEquipmentParameter.numerator_meter.uuid;
			}
			if (modifiedCombinedEquipmentParameter.denominator_meter != null) {
				modifiedCombinedEquipmentParameter.denominator_meter_uuid = modifiedCombinedEquipmentParameter.denominator_meter.uuid;
			}
			CombinedEquipmentParameterService.editCombinedEquipmentParameter($scope.currentCombinedEquipment.id, modifiedCombinedEquipmentParameter, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMBINED_EQUIPMENT.PARAMETER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getParametersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
				} else {
					var templateName = "COMBINED_EQUIPMENT.PARAMETER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
	};

	$scope.deleteCombinedEquipmentParameter = function (combinedequipmentparameter) {
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
			function (isConfirm) {
				if (isConfirm) {
					CombinedEquipmentParameterService.deleteCombinedEquipmentParameter($scope.currentCombinedEquipment.id, combinedequipmentparameter.id, function (error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "COMBINED_EQUIPMENT.PARAMETER";
							templateName = $translate.instant(templateName);

							var popType = 'TOASTER.SUCCESS';
							var popTitle = $common.toaster.success_title;
							var popBody = $common.toaster.success_delete_body;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody, { template: templateName });

							toaster.pop({
								type: popType,
								title: popTitle,
								body: popBody,
								showCloseButton: true,
							});
							$scope.getParametersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
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
							var templateName = "COMBINED_EQUIPMENT.PARAMETER";
							templateName = $translate.instant(templateName);

							var popType = 'TOASTER.ERROR';
							var popTitle = $common.toaster.error_title;
							var popBody = $common.toaster.error_delete_body;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody, { template: templateName });

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
		MeterService.getAllMeters(function (error, data) {
			if (!error) {
				$scope.meters = data;
				for (var i = 0; i < $scope.meters.length; i++) {
					var mergedmeter = { "uuid": $scope.meters[i].uuid, "name": "meter/" + $scope.meters[i].name };
					$scope.mergedmeters.push(mergedmeter);
				}
				// $scope.currentMeterType="meters";
				// $timeout(function(){
				// 	$scope.changeMeterType();
				// },1000);
			} else {
				$scope.meters = [];
			}
		});

		OfflineMeterService.getAllOfflineMeters(function (error, data) {
			if (!error) {
				$scope.offlinemeters = data;
				for (var i = 0; i < $scope.offlinemeters.length; i++) {
					var mergedmeter = { "uuid": $scope.offlinemeters[i].uuid, "name": "offlinemeter/" + $scope.offlinemeters[i].name };
					$scope.mergedmeters.push(mergedmeter);
				}
			} else {
				$scope.offlinemeters = [];
			}
		});

		VirtualMeterService.getAllVirtualMeters(function (error, data) {
			if (!error) {
				$scope.virtualmeters = data;
				for (var i = 0; i < $scope.virtualmeters.length; i++) {
					var mergedmeter = { "uuid": $scope.virtualmeters[i].uuid, "name": "virtualmeter/" + $scope.virtualmeters[i].name };
					$scope.mergedmeters.push(mergedmeter);
				}
			} else {
				$scope.virtualmeters = [];
			}
		});

		console.log($scope.mergedmeters);
	};

	$scope.getAllPoints = function () {
		PointService.getAllPoints(function (error, data) {
			if (!error) {
				// if (data.length > 0) {
				//   for (var i = 0; i < data.length; i++) {
				//     data[i].name = data[i].data_source.name + "/" + data[i].name ;
				//   }
				// }
				$scope.points = data;
			} else {
				$scope.points = [];
			}
		});

	};

	$scope.getAllCombinedEquipments();
	$scope.getMergedMeters();
	$scope.getAllPoints();

	$scope.$on('handleBroadcastCombinedEquipmentChanged', function (event) {
		$scope.getAllCombinedEquipments();
	});
});


app.controller('ModalAddCombinedEquipmentParameterCtrl', function ($scope, $uibModalInstance, params) {

	$scope.operation = "COMBINED_EQUIPMENT.ADD_PARAMETER";
	$scope.combinedequipmentparameter = {
		parameter_type: "constant",
	};
	$scope.is_disabled = false;
	$scope.points = params.points;
	$scope.mergedmeters = params.mergedmeters;
	$scope.ok = function () {

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
	$scope.ok = function () {
		$uibModalInstance.close($scope.combinedequipmentparameter);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
