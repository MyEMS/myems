'use strict';

app.controller('SensorController', function($scope,  $translate,$common, $uibModal, SensorService, toaster, SweetAlert) {

	$scope.getAllSensors = function() {
		SensorService.getAllSensors(function(error, data) {
			if (!error) {
				$scope.sensors = data;
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
			SensorService.addSensor(sensor, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "COMMON.SENSOR";
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
					$scope.getAllSensors();
					$scope.$emit('handleEmitSensorChanged');
				} else {
					var templateName = "COMMON.SENSOR";
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
			SensorService.editSensor(modifiedSensor, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMMON.SENSOR";
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
					$scope.getAllSensors();
					$scope.$emit('handleEmitSensorChanged');
				} else {
					var templateName = "COMMON.SENSOR";
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

	$scope.deleteSensor = function(sensor) {
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
					SensorService.deleteSensor(sensor, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "COMMON.SENSOR";
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
							$scope.getAllSensors();
							$scope.$emit('handleEmitSensorChanged');
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
							var templateName = "COMMON.SENSOR";
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
