'use strict';

app.controller('SensorController', function($scope,  $translate, $uibModal, SensorService, toaster, SweetAlert) {

	$scope.getAllSensors = function() {
		SensorService.getAllSensors(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.sensors = response.data;
			} else {
				$scope.sensors = [];
			}
		});

	};

	$scope.addSensor = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/sensor/sensor.model.html',
			controller: 'ModalAddSensorCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						sensors: angular.copy($scope.sensors),
					};
				}
			}
		});
		modalInstance.result.then(function(sensor) {
			SensorService.addSensor(sensor, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SENSOR")}),
						showCloseButton: true,
					});
					$scope.getAllSensors();
					$scope.$emit('handleEmitSensorChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.SENSOR")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editSensor = function(sensor) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/sensor/sensor.model.html',
			controller: 'ModalEditSensorCtrl',
			resolve: {
				params: function() {
					return {
						sensor: angular.copy(sensor),
						sensors: angular.copy($scope.sensors),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedSensor) {
			SensorService.editSensor(modifiedSensor, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.SENSOR")}),
						showCloseButton: true,
					});
					$scope.getAllSensors();
					$scope.$emit('handleEmitSensorChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.SENSOR")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
	};

	$scope.deleteSensor = function(sensor) {
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
					SensorService.deleteSensor(sensor, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.SENSOR")}),
                                showCloseButton: true,
                            });
							$scope.getAllSensors();
							$scope.$emit('handleEmitSensorChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.SENSOR")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.getAllSensors();
});

app.controller('ModalAddSensorCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "SENSOR.ADD_SENSOR";
	$scope.ok = function() {
		$uibModalInstance.close($scope.sensor);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditSensorCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SENSOR.EDIT_SENSOR";
	$scope.sensor = params.sensor;
	$scope.sensors = params.sensors;
	$scope.ok = function() {
		$uibModalInstance.close($scope.sensor);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
