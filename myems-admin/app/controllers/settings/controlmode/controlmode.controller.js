'use strict';

app.controller('ControlModeController', function(
	$scope,
	$rootScope,
	$window,
	$uibModal,
	$translate,
	ControlModeService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.getAllControlModes = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ControlModeService.getAllControlModes(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.controlmodes = response.data;
			} else {
				$scope.controlmodes = [];
			}
		});

	};

	$scope.addControlMode = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/controlmode/controlmode.model.html',
			controller: 'ModalAddControlModeCtrl',
			windowClass: "animated fadeIn",
			size: 'lg',
			resolve: {
				params: function() {
					return {
						categories: angular.copy($scope.categories)
					};
				}
			}
		});
		modalInstance.result.then(function(controlmode) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			ControlModeService.addControlMode(controlmode, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("COMMON.CONTROL_MODE")}),
						showCloseButton: true,
					});
					$scope.getAllControlModes();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.CONTROL_MODE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editControlMode = function(controlmode) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/controlmode/controlmode.model.html',
			controller: 'ModalEditControlModeCtrl',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						controlmode: angular.copy(controlmode),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedControlMode) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			ControlModeService.editControlMode(modifiedControlMode, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.CONTROL_MODE")}),
						showCloseButton: true,
					});
					$scope.getAllControlModes();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.CONTROL_MODE")}),
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

	$scope.deleteControlMode = function(controlmode) {
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
					ControlModeService.deleteControlMode(controlmode, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.CONTROL_MODE")}),
                                showCloseButton: true,
                            });
							$scope.getAllControlModes();
						} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.CONTROL_MODE")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
						}
					});
				}
			}
		);
	};

	$scope.exportControlMode = function(controlmode) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ControlModeService.exportControlMode(controlmode, headers, function(response) {
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

	$scope.cloneControlMode = function(controlmode){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ControlModeService.cloneControlMode(controlmode, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.CONTROL_MODE")}),
					showCloseButton: true,
				});
				$scope.getAllControlModes();
				$scope.$emit('handleEmitControlModeChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.CONTROL_MODE")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importControlMode = function() {
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
			ControlModeService.importControlMode(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.CONTROL_MODE")}),
						showCloseButton: true,
					});
					$scope.getAllControlModes();
					$scope.$emit('handleEmitControlModeChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.CONTROL_MODE") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllControlModes();

});

app.controller('ModalAddControlModeCtrl', function($scope, $timeout, $uibModalInstance, params, $translate) {

	$scope.operation = "SETTING.ADD_CONTROL_MODE";
	$scope.disable=false;
	$scope.categories = params.categories;
	$scope.times = [];
	$scope.controlmode = {
		is_active: false
	};
	$scope.t={};
	$scope.t.start_hour = '00';
	$scope.t.start_min = '00';
	$scope.t.start_second = '00';
	$scope.t.end_hour = '23';
	$scope.t.end_min = '59';
	$scope.t.end_second = '59';
	$scope.t.power_value = 5;

	$scope.dtOptions = {
		locale:{
			format: 'YYYY-MM-DD HH:mm:ss',
			applyLabel: "OK",
			cancelLabel: "Cancel",
		},
		timePicker: true,
		timePicker24Hour: true,
		timePickerSeconds: true,
		timePickerIncrement: 1,
		singleDatePicker: true,
	};

	$scope.error = {
		show: false,
		message: ''
	};

	$scope.isEndTimeBeforeStartTime = function(startTime, endTime) {
        if (!startTime || !endTime) {
            return true;
        }
        var startParts = startTime.split(':');
        var endParts = endTime.split(':');

        var startSeconds = parseInt(startParts[0]) * 3600 + parseInt(startParts[1]) * 60 + parseInt(startParts[2]);
        var endSeconds = parseInt(endParts[0]) * 3600 + parseInt(endParts[1]) * 60 + parseInt(endParts[2]);

        return endSeconds <= startSeconds;
    };

	$scope.ok = function() {
		for (var i = 0; i < $scope.times.length; i++) {
        	var item = $scope.times[i];
        	if ($scope.isEndTimeBeforeStartTime(item.start_time_of_day, item.end_time_of_day)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
            	return;
        	}
    	}
		$scope.error.show = false;
		$scope.controlmode.times=$scope.times;
		$uibModalInstance.close($scope.controlmode);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};


	$scope.add = function(t) {
		if (t.power_value == null){
			return false;
		}
		t.start_time_of_day= t.start_hour + ':' + t.start_min + ':' + t.start_second;
		t.end_time_of_day= t.end_hour + ':' + t.end_min + ':' + t.end_second;

		if ($scope.isEndTimeBeforeStartTime(t.start_time_of_day, t.end_time_of_day)) {
			$scope.error.show = true;
			$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
			return;
		}

		$scope.error.show = false;
    	$scope.error.message = '';

		if ($scope.times.length > 0) {
			$scope.times.unshift(angular.copy(t));
		} else {
			$scope.times.push(angular.copy(t));
		}
		$scope.t={};
		$scope.t.start_hour = '00';
		$scope.t.start_min = '00';
		$scope.t.start_second = '00';
		$scope.t.end_hour = '23';
		$scope.t.end_min = '59';
		$scope.t.end_second = '59';
		$scope.t.power_value = 5;

		$timeout(function() {
			angular.element('#touTable').trigger('footable_redraw');
		}, 10);
	};
	$scope.delete = function(key) {
		$scope.times.splice(key, 1);
		$timeout(function() {
			angular.element('#touTable').trigger('footable_redraw');
		}, 10);
	};
});

app.controller('ModalEditControlModeCtrl', function($scope, $timeout, $uibModalInstance, params, $translate) {
	$scope.operation = "SETTING.EDIT_CONTROL_MODE";
	$scope.disable=true;
	$scope.controlmode = params.controlmode;
	$scope.times = $scope.controlmode.times;
	$scope.t={};
	$scope.t.start_hour = '00';
	$scope.t.start_min = '00';
	$scope.t.start_second = '00';
	$scope.t.end_hour = '23';
	$scope.t.end_min = '59';
	$scope.t.end_second = '59';
	$scope.t.power_value = 5;
	$scope.dtOptions = {
		locale:{
			format: 'YYYY-MM-DD HH:mm:ss',
			applyLabel: "OK",
			cancelLabel: "Cancel",
		},
		timePicker: true,
		timePicker24Hour: true,
		timePickerSeconds: true,
		timePickerIncrement: 1,
		singleDatePicker: true,
	};

	$timeout(function() {
		angular.element('#touTable').trigger('footable_redraw');
	}, 100);

	$scope.error = {
    	show: false,
    	message: ''
	};

	$scope.isEndTimeBeforeStartTime = function(startTime, endTime) {
        if (!startTime || !endTime) {
            return true;
        }
        var startParts = startTime.split(':');
        var endParts = endTime.split(':');

        var startSeconds = parseInt(startParts[0]) * 3600 + parseInt(startParts[1]) * 60 + parseInt(startParts[2]);
        var endSeconds = parseInt(endParts[0]) * 3600 + parseInt(endParts[1]) * 60 + parseInt(endParts[2]);

        return endSeconds <= startSeconds;
    };

	$scope.ok = function() {
		$scope.error.show = false;
    	for (var i = 0; i < $scope.times.length; i++) {
        	var item = $scope.times[i];
        	if ($scope.isEndTimeBeforeStartTime(item.start_time_of_day, item.end_time_of_day)) {
            	$scope.error.show = true;
            	$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
            	return;
        	}
    	}

    	$scope.controlmode.times = $scope.times;
		$uibModalInstance.close($scope.controlmode);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.add = function(t) {
		if (t.power_value == null){
			return false;
		}
		t.start_time_of_day= t.start_hour + ':' + t.start_min + ':' + t.start_second;
		t.end_time_of_day= t.end_hour + ':' + t.end_min + ':' + t.end_second;

		if ($scope.isEndTimeBeforeStartTime(t.start_time_of_day, t.end_time_of_day)) {
        	$scope.error.show = true;
        	$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
        	return;
    	}

    	$scope.error.show = false;
    	$scope.error.message = '';

		if ($scope.times.length > 0) {
			$scope.times.unshift(angular.copy(t));
		} else {
			$scope.times.push(angular.copy(t));
		}
		$scope.t={};
		$scope.t.start_hour = '00';
		$scope.t.start_min = '00';
		$scope.t.start_second = '00';
		$scope.t.end_hour = '23';
		$scope.t.end_min = '59';
		$scope.t.end_second = '59';
		$scope.t.power_value = 5;

		$timeout(function() {
			angular.element('#touTable').trigger('footable_redraw');
		}, 10);
	};

	$scope.delete = function(key) {
		$scope.times.splice(key, 1);
		$timeout(function() {
			angular.element('#touTable').trigger('footable_redraw');
		}, 10);
	};
});
