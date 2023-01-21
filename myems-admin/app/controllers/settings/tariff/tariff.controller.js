'use strict';

app.controller('TariffController', function(
	$scope,
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
	$scope.getAllCategories = function() {
		CategoryService.getAllCategories(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.categories = response.data;
			} else {
				$scope.categories = [];
			}
		});

	};
	$scope.getAllTariffs = function() {
		TariffService.getAllTariffs(function (response) {
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

	$scope.getAllTariffs();
	$scope.getAllCategories();

});

app.controller('ModalAddTariffCtrl', function($scope, $timeout, $uibModalInstance, TARIFF_TYPE, PEAK_TYPE, params) {

	$scope.operation = "SETTING.ADD_TARIFF";
	$scope.disable=false;
	$scope.categories = params.categories;
	$scope.timeofuse = [];
	$scope.block=[];
	$scope.tariff={valid_from:moment(),valid_through:moment()};
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

	$scope.ok = function() {
		if($scope.tariff.tariff_type=='timeofuse'){
			$scope.tariff.timeofuse=$scope.timeofuse;
		}else if($scope.tariff.tariff_type=='block'){
			$scope.tariff.block=$scope.block;
		}
		$scope.tariff.valid_from=$scope.tariff.valid_from.format().slice(0,19);
		$scope.tariff.valid_through=$scope.tariff.valid_through.format().slice(0,19);
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
		} else if($scope.tariff.tariff_type=='block'){
			if ($scope.block.length > 0) {
				$scope.block.unshift(angular.copy(t));
			} else {
				$scope.block.push(angular.copy(t));
			}
			$scope.b = {};

			$timeout(function() {
				angular.element('#blockTable').trigger('footable_redraw');
			}, 10);
		}

	};
	$scope.delete = function(key) {
		if($scope.tariff.tariff_type=='timeofuse'){
			$scope.timeofuse.splice(key, 1);
			$timeout(function() {
				angular.element('#touTable').trigger('footable_redraw');
			}, 10);
		}else if($scope.tariff.tariff_type=='block'){
			$scope.block.splice(key, 1);
			$timeout(function() {
				angular.element('#blockTable').trigger('footable_redraw');
			}, 10);
		}
	};
});

app.controller('ModalEditTariffCtrl', function($scope, $timeout, $uibModalInstance, TARIFF_TYPE, PEAK_TYPE, params) {
	$scope.operation = "SETTING.EDIT_TARIFF";
	$scope.disable=true;
	$scope.tariff = params.tariff;
	$scope.categories = params.categories;
	$scope.timeofuse = $scope.tariff.timeofuse;
	$scope.block=$scope.tariff.block;
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
		} else if ($scope.tariff.tariff_type == 'block') {
			angular.element('#blockTable').trigger('footable_redraw');
		}
	}, 100);

	$scope.ok = function() {
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
		} else if($scope.tariff.tariff_type=='block'){
			if ($scope.block.length > 0) {
				$scope.block.unshift(angular.copy(t));
			} else {
				$scope.block.push(angular.copy(t));
			}
			$scope.b = {};

			$timeout(function() {
				angular.element('#blockTable').trigger('footable_redraw');
			}, 10);
		}
	};

	$scope.delete = function(key) {
		if($scope.tariff.tariff_type=='timeofuse'){
			$scope.timeofuse.splice(key, 1);
			$timeout(function() {
				angular.element('#touTable').trigger('footable_redraw');
			}, 10);
		}else if($scope.tariff.tariff_type=='block'){
			$scope.block.splice(key, 1);
			$timeout(function() {
				angular.element('#blockTable').trigger('footable_redraw');
			}, 10);
		}
	};
});
