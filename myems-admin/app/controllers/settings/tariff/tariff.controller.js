'use strict';

app.controller('TariffController', function(
	$scope,
	$rootScope,
	$window,
	$uibModal,
	$translate,
	TARIFF_TYPE,
	PEAK_TYPE,
	TariffService,
	CategoryService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

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
	$scope.getAllTariffs = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TariffService.getAllTariffs(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.tariffs = response.data;
			} else {
				$scope.tariffs = [];
			}
		});

	};

	$scope.showTariffType = function(type) {
		return TARIFF_TYPE[type];
	};

	$scope.addTariff = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/tariff/tariff.model.html',
			controller: 'ModalAddTariffCtrl',
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
		modalInstance.result.then(function(tariff) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			TariffService.addTariff(tariff, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("SETTING.TARIFF")}),
						showCloseButton: true,
					});
					$scope.getAllTariffs();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.TARIFF")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editTariff = function(tariff) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/tariff/tariff.model.html',
			controller: 'ModalEditTariffCtrl',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						tariff: angular.copy(tariff),
						categories: angular.copy($scope.categories)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedTariff) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			TariffService.editTariff(modifiedTariff, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.TARIFF")}),
						showCloseButton: true,
					});
					$scope.getAllTariffs();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.TARIFF")}),
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

	$scope.deleteTariff = function(tariff) {
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
					TariffService.deleteTariff(tariff, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.TARIFF")}),
                                showCloseButton: true,
                            });
							$scope.getAllTariffs();
						} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.TARIFF")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
						}
					});
				}
			}
		);
	};

	$scope.exportTariff = function(tariff) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TariffService.exportTariff(tariff, headers, function(response) {
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

	$scope.cloneTariff = function(tariff){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TariffService.cloneTariff(tariff, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.TARIFF")}),
					showCloseButton: true,
				});
				$scope.getAllTariffs();
				$scope.$emit('handleEmitTariffChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.TARIFF")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importTariff = function() {
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
			TariffService.importTariff(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.TARIFF")}),
						showCloseButton: true,
					});
					$scope.getAllTariffs();
					$scope.$emit('handleEmitTariffChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("SETTING.TARIFF") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllTariffs();
	$scope.getAllCategories();

});

app.controller('ModalAddTariffCtrl', function($scope, $timeout, $uibModalInstance, TARIFF_TYPE, PEAK_TYPE, params, $translate) {

	$scope.operation = "SETTING.ADD_TARIFF";
	$scope.disable=false;
	$scope.categories = params.categories;
	$scope.timeofuse = [];
	$scope.tariff = {
		tariff_type: 'timeofuse',
		valid_from: moment(),
		valid_through: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59)
	};
	$scope.t={};
	$scope.t.start_hour = '00';
	$scope.t.start_min = '00';
	$scope.t.start_second = '00';
	$scope.t.end_hour = '23';
	$scope.t.end_min = '59';
	$scope.t.end_second = '59';
	$scope.t.peak_type = 'midpeak';
	$scope.t.price = 0.5;

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
	$scope.showPeakType = function(type) {
		return PEAK_TYPE[type];
	};

	$scope.error = {
		show: false,
		message: ''
	};

	$scope.error_rate_validity_period = {
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

	$scope.checkTimeOverlap = function(timeofuseList) {
		if (!timeofuseList || timeofuseList.length <= 1) {
			return false;
		}
		function timeToSeconds(timeStr) {
			var parts = timeStr.split(':');
			return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
		}
		function isOverlap(start1, end1, start2, end2) {
			if (end1 <= start1) {
				return (start2 >= start1 || start2 <= end1) && (end2 >= start1 || end2 <= end1);
			} else if (end2 <= start2) {
				return (start1 >= start2 || start1 <= end2) && (end1 >= start2 || end1 <= end2);
			} else {
				return Math.max(start1, start2) < Math.min(end1, end2);
			}
		}
		for (var i = 0; i < timeofuseList.length; i++) {
			var time1 = timeofuseList[i];
			var start1 = timeToSeconds(time1.start_time_of_day);
			var end1 = timeToSeconds(time1.end_time_of_day);

			for (var j = i + 1; j < timeofuseList.length; j++) {
				var time2 = timeofuseList[j];
				var start2 = timeToSeconds(time2.start_time_of_day);
				var end2 = timeToSeconds(time2.end_time_of_day);

				if (isOverlap(start1, end1, start2, end2)) {
					return true;
				}
			}
		}
		return false;
	}

	$scope.ok = function() {
		for (var i = 0; i < $scope.timeofuse.length; i++) {
        	var item = $scope.timeofuse[i];
        	if ($scope.isEndTimeBeforeStartTime(item.start_time_of_day, item.end_time_of_day)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
            	return;
        	}
    	}

		if ($scope.tariff.tariff_type == 'timeofuse' && $scope.timeofuse.length > 1) {
        	if ($scope.checkTimeOverlap($scope.timeofuse)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.TARIFF_TIME_PERIODS_OVERLAP");
				return;
			}
		}

		if ($scope.tariff.valid_from && $scope.tariff.valid_through) {
			var validFrom = moment($scope.tariff.valid_from);
			var validThrough = moment($scope.tariff.valid_through);
			if (validThrough.isSameOrBefore(validFrom)) {
				$scope.error_rate_validity_period.show = true;
				$scope.error_rate_validity_period.message = $translate.instant("SETTING.VALID_THROUGH_TIME_SHOULD_BE_AFTER_VALID_FROM_TIME");
				return;
			}
		}

		$scope.error.show = false;
		$scope.error.message = '';
		$scope.error_rate_validity_period.show = false;
		$scope.error_rate_validity_period.message= '';

		if($scope.tariff.tariff_type=='timeofuse'){
			$scope.tariff.timeofuse=$scope.timeofuse;
		}
		$scope.tariff.valid_from=moment($scope.tariff.valid_from).format().slice(0,19);
		$scope.tariff.valid_through=moment($scope.tariff.valid_through).format().slice(0,19);
		$uibModalInstance.close($scope.tariff);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
	$scope.add = function(t) {
		if (t.peak_type == null || t.price == null || t.peak_type == ''){
			return false;
		}
		t.start_time_of_day= t.start_hour + ':' + t.start_min + ':' + t.start_second;
		t.end_time_of_day= t.end_hour + ':' + t.end_min + ':' + t.end_second;

		if ($scope.isEndTimeBeforeStartTime(t.start_time_of_day, t.end_time_of_day)) {
			$scope.error.show = true;
			$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
			return;
		}

		if ($scope.tariff.tariff_type == 'timeofuse') {
			var tempTimeofuse = angular.copy($scope.timeofuse);
			tempTimeofuse.push(angular.copy(t));

			if (tempTimeofuse.length > 1) {
				if ($scope.checkTimeOverlap(tempTimeofuse)) {
					$scope.error.show = true;
					$scope.error.message = $translate.instant("SETTING.TARIFF_TIME_PERIODS_OVERLAP");
					return;
				}
			}
		}

		$scope.error.show = false;
		$scope.error.message = '';


		if ($scope.tariff.tariff_type == 'timeofuse') {
			if ($scope.timeofuse.length > 0) {
				$scope.timeofuse.unshift(angular.copy(t));
			} else {
				$scope.timeofuse.push(angular.copy(t));
			}
			$scope.t={};
			$scope.t.start_hour = '00';
			$scope.t.start_min = '00';
			$scope.t.start_second = '00';
			$scope.t.end_hour = '23';
			$scope.t.end_min = '59';
			$scope.t.end_second = '59';
			$scope.t.peak_type = 'midpeak';
			$scope.t.price = 0.5;

			$timeout(function() {
				angular.element('#touTable').trigger('footable_redraw');
			}, 10);
		}
	};
	$scope.delete = function(key) {
		if($scope.tariff.tariff_type=='timeofuse'){
			$scope.timeofuse.splice(key, 1);
			$timeout(function() {
				angular.element('#touTable').trigger('footable_redraw');
			}, 10);
		}
	};
});

app.controller('ModalEditTariffCtrl', function($scope, $timeout, $uibModalInstance, TARIFF_TYPE, PEAK_TYPE, params, $translate) {
	$scope.operation = "SETTING.EDIT_TARIFF";
	$scope.disable=true;
	$scope.tariff = params.tariff;
	$scope.categories = params.categories;
	$scope.timeofuse = $scope.tariff.timeofuse;
	$scope.t={};
	$scope.t.start_hour = '00';
	$scope.t.start_min = '00';
	$scope.t.start_second = '00';
	$scope.t.end_hour = '23';
	$scope.t.end_min = '59';
	$scope.t.end_second = '59';
	$scope.t.peak_type = 'midpeak';
	$scope.t.price = 0.5;
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

	$scope.showPeakType = function(type) {
		return PEAK_TYPE[type];
	};

	$timeout(function() {
		if ($scope.tariff.tariff_type == 'timeofuse') {
			angular.element('#touTable').trigger('footable_redraw');
		}
	}, 100);

	$scope.error = {
    	show: false,
    	message: ''
	};

	$scope.error_rate_validity_period = {
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

	$scope.checkTimeOverlap = function(timeofuseList) {
		if (!timeofuseList || timeofuseList.length <= 1) {
			return false;
		}
		function timeToSeconds(timeStr) {
			var parts = timeStr.split(':');
			return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
		}
		function isOverlap(start1, end1, start2, end2) {
			if (end1 <= start1) {
				return (start2 >= start1 || start2 <= end1) && (end2 >= start1 || end2 <= end1);
			} else if (end2 <= start2) {
				return (start1 >= start2 || start1 <= end2) && (end1 >= start2 || end1 <= end2);
			} else {
				return Math.max(start1, start2) < Math.min(end1, end2);
			}
		}
		for (var i = 0; i < timeofuseList.length; i++) {
			var time1 = timeofuseList[i];
			var start1 = timeToSeconds(time1.start_time_of_day);
			var end1 = timeToSeconds(time1.end_time_of_day);

			for (var j = i + 1; j < timeofuseList.length; j++) {
				var time2 = timeofuseList[j];
				var start2 = timeToSeconds(time2.start_time_of_day);
				var end2 = timeToSeconds(time2.end_time_of_day);

				if (isOverlap(start1, end1, start2, end2)) {
					return true;
				}
			}
		}
		return false;
	}

	$scope.ok = function() {
    	for (var i = 0; i < $scope.timeofuse.length; i++) {
        	var item = $scope.timeofuse[i];
        	if ($scope.isEndTimeBeforeStartTime(item.start_time_of_day, item.end_time_of_day)){
            	$scope.error.show = true;
            	$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
            	return;
        	}
    	}

		if ($scope.tariff.tariff_type == 'timeofuse' && $scope.timeofuse.length > 1) {
        	if ($scope.checkTimeOverlap($scope.timeofuse)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.TARIFF_TIME_PERIODS_OVERLAP");
				return;
			}
		}

		if ($scope.tariff.valid_from && $scope.tariff.valid_through) {
			var validFrom = moment($scope.tariff.valid_from);
			var validThrough = moment($scope.tariff.valid_through);
			if (validThrough.isSameOrBefore(validFrom)) {
				$scope.error_rate_validity_period.show = true;
				$scope.error_rate_validity_period.message = $translate.instant("SETTING.VALID_THROUGH_TIME_SHOULD_BE_AFTER_VALID_FROM_TIME");
				return;
			}
		}

		$scope.error.show = false;
		$scope.error.message = '';
		$scope.error_rate_validity_period.show = false;
		$scope.error_rate_validity_period.message= '';

		if($scope.tariff.tariff_type=='timeofuse'){
			$scope.tariff.timeofuse=$scope.timeofuse;
		}

		$scope.tariff.valid_from=moment($scope.tariff.valid_from).format().slice(0,19);
		$scope.tariff.valid_through=moment($scope.tariff.valid_through).format().slice(0,19);
		$uibModalInstance.close($scope.tariff);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.add = function(t) {
		if (t.peak_type == null || t.price == null || t.peak_type == ''){
			return false;
		}
		t.start_time_of_day= t.start_hour + ':' + t.start_min + ':' + t.start_second;
		t.end_time_of_day= t.end_hour + ':' + t.end_min + ':' + t.end_second;

		if ($scope.isEndTimeBeforeStartTime(t.start_time_of_day, t.end_time_of_day)) {
        	$scope.error.show = true;
        	$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
        	return;
    	}

    	if ($scope.tariff.tariff_type == 'timeofuse') {
			var tempTimeofuse = angular.copy($scope.timeofuse);
			tempTimeofuse.push(angular.copy(t));

			if (tempTimeofuse.length > 1) {
				if ($scope.checkTimeOverlap(tempTimeofuse)) {
					$scope.error.show = true;
					$scope.error.message = $translate.instant("SETTING.TARIFF_TIME_PERIODS_OVERLAP");
					return;
				}
			}
		}

		$scope.error.show = false;
		$scope.error.message = '';

		if ($scope.tariff.tariff_type == 'timeofuse') {
			if ($scope.timeofuse.length > 0) {
				$scope.timeofuse.unshift(angular.copy(t));
			} else {
				$scope.timeofuse.push(angular.copy(t));
			}
			$scope.t={};
			$scope.t.start_hour = '00';
			$scope.t.start_min = '00';
			$scope.t.start_second = '00';
			$scope.t.end_hour = '23';
			$scope.t.end_min = '59';
			$scope.t.end_second = '59';
			$scope.t.peak_type = 'midpeak';
			$scope.t.price = 0.5;

			$timeout(function() {
				angular.element('#touTable').trigger('footable_redraw');
			}, 10);
		}
	};

	$scope.delete = function(key) {
		if($scope.tariff.tariff_type=='timeofuse'){
			$scope.timeofuse.splice(key, 1);
			$timeout(function() {
				angular.element('#touTable').trigger('footable_redraw');
			}, 10);
		}
	};
});
