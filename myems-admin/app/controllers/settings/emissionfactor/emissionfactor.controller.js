'use strict';

// Emission Factor controller - carbon dioxide emission factor management

app.controller('EmissionFactorController', function(
	$scope,
	$rootScope,
	$window,
	$uibModal,
	$translate,
	EmissionFactorService,
	CategoryService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';
	$scope.searchKeyword = '';

	// Load all categories from API
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
	// Load all emission factors from API
	$scope.getAllEmissionFactors = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EmissionFactorService.getAllEmissionFactors(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.emissionfactors = response.data;
			} else {
				$scope.emissionfactors = [];
			}
		});

	};

	// Open add modal and create emission factor
	$scope.addEmissionFactor = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/emissionfactor/emissionfactor.model.html',
			controller: 'ModalAddEmissionFactorCtrl',
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
		modalInstance.result.then(function(emissionfactor) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EmissionFactorService.addEmissionFactor(emissionfactor, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("SETTING.EMISSION_FACTOR")}),
						showCloseButton: true,
					});
					$scope.getAllEmissionFactors();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.EMISSION_FACTOR")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	// Open edit modal and update emission factor
	$scope.editEmissionFactor = function(emissionfactor) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/emissionfactor/emissionfactor.model.html',
			controller: 'ModalEditEmissionFactorCtrl',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						emissionfactor: angular.copy(emissionfactor),
						categories: angular.copy($scope.categories)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedEmissionFactor) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EmissionFactorService.editEmissionFactor(modifiedEmissionFactor, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.EMISSION_FACTOR")}),
						showCloseButton: true,
					});
					$scope.getAllEmissionFactors();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.EMISSION_FACTOR")}),
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

	// Confirm and delete emission factor
	$scope.deleteEmissionFactor = function(emissionfactor) {
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
					EmissionFactorService.deleteEmissionFactor(emissionfactor, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.EMISSION_FACTOR")}),
								showCloseButton: true,
							});
							$scope.getAllEmissionFactors();
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.EMISSION_FACTOR")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			}
		);
	};

	// Export emission factor as JSON
	$scope.exportEmissionFactor = function(emissionfactor) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EmissionFactorService.exportEmissionFactor(emissionfactor, headers, function(response) {
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

	// Clone an existing emission factor
	$scope.cloneEmissionFactor = function(emissionfactor){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EmissionFactorService.cloneEmissionFactor(emissionfactor, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.EMISSION_FACTOR")}),
					showCloseButton: true,
				});
				$scope.getAllEmissionFactors();
				$scope.$emit('handleEmitEmissionFactorChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.EMISSION_FACTOR")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	// Import emission factor from JSON
	$scope.importEmissionFactor = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/common/import.html',
			controller: 'ModalImportCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						description: 'SETTING.IMPORT_EMISSION_FACTOR_DESCRIPTION',
						description_more: 'SETTING.IMPORT_EMISSION_FACTOR_DESCRIPTION_MORE'
					};
				}
			}
		});
		modalInstance.result.then(function(importdata) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EmissionFactorService.importEmissionFactor(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.EMISSION_FACTOR")}),
						showCloseButton: true,
					});
					$scope.getAllEmissionFactors();
					$scope.$emit('handleEmitEmissionFactorChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("SETTING.EMISSION_FACTOR") }),
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
	// Search emission factors by keyword
	$scope.searchEmissionFactors = function() {
		const headers = {
			"User-UUID": $scope.cur_user?.uuid,
			"Token": $scope.cur_user?.token
		};
		const rawKeyword = $scope.searchKeyword || "";
		const trimmedKeyword = rawKeyword.trim();

		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}

		searchDebounceTimer = setTimeout( () => {
			if (!trimmedKeyword) {
				$scope.getAllEmissionFactors();
				safeApply($scope);
				return;
			}
			EmissionFactorService.searchEmissionFactors(trimmedKeyword, headers, (response) => {
				$scope.emissionfactors = (response.status === 200) ? response.data : [];
				$scope.parentmeters = [...$scope.emissionfactors];
			});
		},300);
	};

	$scope.getAllEmissionFactors();
	$scope.getAllCategories();

});

// Modal controller for add dialog
app.controller('ModalAddEmissionFactorCtrl', function($scope, $timeout, $uibModalInstance, params, $translate) {

	$scope.operation = "SETTING.ADD_EMISSION_FACTOR";
	$scope.categories = params.categories;
	$scope.timeofuse = [];
	$scope.emissionfactor = {
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
	$scope.t.factor = 0.5;

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

	$scope.checkFullDayCoverage = function(timeofuseList) {
		if (!timeofuseList || timeofuseList.length === 0) {
			return false;
		}
		function timeToSeconds(timeStr) {
			var parts = timeStr.split(':');
			return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
		}
		var timeRanges = [];
		for (var i = 0; i < timeofuseList.length; i++) {
			var item = timeofuseList[i];
			timeRanges.push({
				start: timeToSeconds(item.start_time_of_day),
				end: timeToSeconds(item.end_time_of_day)
			});
		}
		var normalizedRanges = [];
		for (var i = 0; i < timeRanges.length; i++) {
			var range = timeRanges[i];
			if (range.end <= range.start) {
				normalizedRanges.push({start: range.start, end: 24 * 3600});
				normalizedRanges.push({start: 0, end: range.end});
			} else {
				normalizedRanges.push(range);
			}
		}
		normalizedRanges.sort(function(a, b) {
			return a.start - b.start;
		});
		if (normalizedRanges[0].start !== 0) {
			return false;
		}
		var currentTime = 0;
		for (var i = 0; i < normalizedRanges.length; i++) {
			var range = normalizedRanges[i];
			if (range.start > currentTime + 1) {
				return false;
			}
			currentTime = Math.max(currentTime, range.end);
		}
		return currentTime >= 24 * 3600 - 1;
	};


	$scope.ok = function() {
		for (var i = 0; i < $scope.timeofuse.length; i++) {
        	var item = $scope.timeofuse[i];
        	if ($scope.isEndTimeBeforeStartTime(item.start_time_of_day, item.end_time_of_day)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
            	return;
        	}
    	}

		if ($scope.timeofuse.length > 0) {
        	if ($scope.checkTimeOverlap($scope.timeofuse)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.EMISSION_FACTOR_TIME_PERIODS_OVERLAP");
				return;
			}
			if (!$scope.checkFullDayCoverage($scope.timeofuse)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.EMISSION_FACTOR_NOT_FULL_DAY_COVERAGE");
				return;
			}
		}

		if ($scope.emissionfactor.valid_from && $scope.emissionfactor.valid_through) {
			var validFrom = moment($scope.emissionfactor.valid_from);
			var validThrough = moment($scope.emissionfactor.valid_through);
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

		$scope.emissionfactor.timeofuse=$scope.timeofuse;
		$scope.emissionfactor.valid_from=moment($scope.emissionfactor.valid_from).format().slice(0,19);
		$scope.emissionfactor.valid_through=moment($scope.emissionfactor.valid_through).format().slice(0,19);
		$uibModalInstance.close($scope.emissionfactor);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
	$scope.add = function(t) {
		if (t.factor == null || t.factor == ''){
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
		$scope.t.factor = 0.5;

		$timeout(function() {
			angular.element('#touFactorTable').trigger('footable_redraw');
		}, 10);
	};
	$scope.delete = function(key) {
		$scope.timeofuse.splice(key, 1);
		$timeout(function() {
			angular.element('#touFactorTable').trigger('footable_redraw');
		}, 10);
	};
});

// Modal controller for edit dialog
app.controller('ModalEditEmissionFactorCtrl', function($scope, $timeout, $uibModalInstance, params, $translate) {
	$scope.operation = "SETTING.EDIT_EMISSION_FACTOR";
	$scope.emissionfactor = params.emissionfactor;
	$scope.categories = params.categories;
	$scope.timeofuse = $scope.emissionfactor.timeofuse || [];
	$scope.t={};
	$scope.t.start_hour = '00';
	$scope.t.start_min = '00';
	$scope.t.start_second = '00';
	$scope.t.end_hour = '23';
	$scope.t.end_min = '59';
	$scope.t.end_second = '59';
	$scope.t.factor = 0.5;
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

		$scope.checkFullDayCoverage = function(timeofuseList) {
		if (!timeofuseList || timeofuseList.length === 0) {
			return false;
		}
		function timeToSeconds(timeStr) {
			var parts = timeStr.split(':');
			return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
		}
		var timeRanges = [];
		for (var i = 0; i < timeofuseList.length; i++) {
			var item = timeofuseList[i];
			timeRanges.push({
				start: timeToSeconds(item.start_time_of_day),
				end: timeToSeconds(item.end_time_of_day)
			});
		}
		var normalizedRanges = [];
		for (var i = 0; i < timeRanges.length; i++) {
			var range = timeRanges[i];
			if (range.end <= range.start) {
				normalizedRanges.push({start: range.start, end: 24 * 3600});
				normalizedRanges.push({start: 0, end: range.end});
			} else {
				normalizedRanges.push(range);
			}
		}
		normalizedRanges.sort(function(a, b) {
			return a.start - b.start;
		});
		if (normalizedRanges[0].start !== 0) {
			return false;
		}
		var currentTime = 0;
		for (var i = 0; i < normalizedRanges.length; i++) {
			var range = normalizedRanges[i];
			if (range.start > currentTime + 1) {
				return false;
			}
			currentTime = Math.max(currentTime, range.end);
		}
		return currentTime >= 24 * 3600 -1;
	};

	$scope.ok = function() {
    	for (var i = 0; i < $scope.timeofuse.length; i++) {
        	var item = $scope.timeofuse[i];
        	if ($scope.isEndTimeBeforeStartTime(item.start_time_of_day, item.end_time_of_day)){
            	$scope.error.show = true;
            	$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
            	return;
        	}
    	}

		if ($scope.timeofuse.length > 0) {
        	if ($scope.checkTimeOverlap($scope.timeofuse)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.EMISSION_FACTOR_TIME_PERIODS_OVERLAP");
				return;
			}
			if (!$scope.checkFullDayCoverage($scope.timeofuse)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.EMISSION_FACTOR_NOT_FULL_DAY_COVERAGE");
				return;
			}
		}

		if ($scope.emissionfactor.valid_from && $scope.emissionfactor.valid_through) {
			var validFrom = moment($scope.emissionfactor.valid_from);
			var validThrough = moment($scope.emissionfactor.valid_through);
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

		$scope.emissionfactor.timeofuse=$scope.timeofuse;

		$scope.emissionfactor.valid_from=moment($scope.emissionfactor.valid_from).format().slice(0,19);
		$scope.emissionfactor.valid_through=moment($scope.emissionfactor.valid_through).format().slice(0,19);
		$uibModalInstance.close($scope.emissionfactor);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.add = function(t) {
		if (t.factor == null || t.factor == ''){
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
		$scope.t.factor = 0.5;

		$timeout(function() {
			angular.element('#touFactorTable').trigger('footable_redraw');
		}, 10);
	};

	$scope.delete = function(key) {
		$scope.timeofuse.splice(key, 1);
		$timeout(function() {
			angular.element('#touFactorTable').trigger('footable_redraw');
		}, 10);
	};
});