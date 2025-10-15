'use strict';

app.controller('SensorController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    SensorService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';
	$scope.searchKeyword = '';
	$scope.getAllSensors = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SensorService.getAllSensors(headers, function (response) {
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			SensorService.addSensor(sensor, headers, function (response) {
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
		$rootScope.modalInstance = modalInstance;
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			SensorService.editSensor(modifiedSensor, headers, function (response) {
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
		$rootScope.modalInstance = modalInstance;
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
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
					SensorService.deleteSensor(sensor, headers, function (response) {
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

	$scope.exportSensor = function(sensor) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SensorService.exportSensor(sensor, headers, function(response) {
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

	$scope.cloneSensor = function(sensor){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SensorService.cloneSensor(sensor, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SENSOR")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitSensorChanged');
				$scope.getAllSensors();
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.SENSOR")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importSensor = function() {
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
			SensorService.importSensor(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SENSOR")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitSensorChanged');
					$scope.getAllSensors();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.SENSOR") }),
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
	$scope.searchSensors = function() {
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
				$scope.getAllSensors();
				safeApply($scope);
				return;
			}

			SensorService.searchSensors(trimmedKeyword, headers, (response) => {
				$scope.sensors = (response.status === 200) ? response.data : [];
				$scope.parentmeters = [...$scope.sensors];
			});
		}, 300);
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
