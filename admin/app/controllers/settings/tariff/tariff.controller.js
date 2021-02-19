'use strict';

app.controller('TariffController', function($scope, $common,$uibModal,$translate, TARIFF_TYPE, PEAK_TYPE, TariffService, CategoryService, toaster, SweetAlert) {

	$scope.getAllCategories = function() {
		CategoryService.getAllCategories(function(error, data) {
			if (!error) {
				$scope.categories = data;
			} else {
				$scope.categories = [];
			}
		});

	};
	$scope.getAllTariffs = function() {
		TariffService.getAllTariffs(function(error, data) {
			if (!error) {
				$scope.tariffs = data;
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
			TariffService.addTariff(tariff, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "SETTING.TARIFF";
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
					$scope.getAllTariffs();
				} else {
					var templateName = "SETTING.TARIFF";
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
			TariffService.editTariff(modifiedTariff, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "SETTING.TARIFF";
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
					$scope.getAllTariffs();
				} else {
					var templateName = "SETTING.TARIFF";
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

	$scope.deleteTariff = function(tariff) {
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
					TariffService.deleteTariff(tariff, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "SETTING.TARIFF";
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
							$scope.getAllTariffs();
						} else {
							var templateName = "SETTING.TARIFF";
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
	$scope.t={start_time_of_day:moment(),end_time_of_day:moment()};
	$scope.dtOptions = {
		locale:{
			format: 'YYYY-MM-DD HH:mm:ss',
			applyLabel: "确定",
			cancelLabel: "取消",
			customRangeLabel: "自定义",
		},
		timePicker: true,
		timePicker24Hour: true,
		timePickerIncrement: 15,
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
		t.start_time_of_day=t.start_time_of_day.format().slice(11, 19);
		t.end_time_of_day=t.end_time_of_day.format().slice(11, 19);
		if ($scope.tariff.tariff_type == 'timeofuse') {
			if ($scope.timeofuse.length > 0) {
				$scope.timeofuse.unshift(angular.copy(t));
			} else {
				$scope.timeofuse.push(angular.copy(t));
			}
			$scope.t={start_time_of_day:moment(),end_time_of_day:moment()};

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

	}
});

app.controller('ModalEditTariffCtrl', function($scope, $timeout, $uibModalInstance, TARIFF_TYPE, PEAK_TYPE, params) {
	$scope.operation = "SETTING.EDIT_TARIFF";
	$scope.disable=true;
	$scope.tariff = params.tariff;
	$scope.categories = params.categories;
	$scope.timeofuse = $scope.tariff.timeofuse;
	$scope.block=$scope.tariff.block;
	$scope.t={start_time_of_day:moment(),end_time_of_day:moment()};
	$scope.dtOptions = {
		locale:{
			format: 'YYYY-MM-DD HH:mm:ss',
			applyLabel: "确定",
			cancelLabel: "取消",
			customRangeLabel: "自定义",
		},
		timePicker: true,
		timePicker24Hour: true,
		timePickerIncrement: 15,
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
		t.start_time_of_day=moment(t.start_time_of_day).format().slice(11, 19);
		t.end_time_of_day=moment(t.end_time_of_day).format().slice(11, 19);
		if ($scope.tariff.tariff_type == 'timeofuse') {
			if ($scope.timeofuse.length > 0) {
				$scope.timeofuse.unshift(angular.copy(t));
			} else {
				$scope.timeofuse.push(angular.copy(t));
			}
			$scope.t={start_time_of_day:moment(),end_time_of_day:moment()};

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

	}
});
