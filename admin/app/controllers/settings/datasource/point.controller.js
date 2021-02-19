'use strict';

app.controller('PointController', function($scope, $common, $uibModal, $timeout, $translate, DataSourceService, PointService, toaster, SweetAlert) {

	$scope.getAllDataSources = function() {
		DataSourceService.getAllDataSources(function(error, data) {
			if (!error) {
				$scope.datasources = data;
				if ($scope.datasources.length > 0) {
					$scope.currentDataSource = $scope.datasources[0].id;
					$scope.getPointsByDataSourceID($scope.currentDataSource);
				}
			} else {
				$scope.datasources = [];
			}
		});

	};

	$scope.getPointsByDataSourceID = function(id) {
		PointService.getPointsByDataSourceID(id, function(error, data) {
			if (!error) {
				$scope.points = data;
			} else {
				$scope.points = [];
			}
		});

	};


	$scope.changeDataSource = function(item, model) {
		$scope.currentDataSource = model;
		$scope.getPointsByDataSourceID($scope.currentDataSource);
	};

	$scope.addPoint = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/datasource/point.model.html',
			controller: 'ModalAddPointCtrl',
			windowClass: "animated fadeIn",
		});
		modalInstance.result.then(function(point) {
			point.data_source_id = $scope.currentDataSource;
			if(point.ratio==""){
				point.ratio = undefined;
			}
			PointService.addPoint(point, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "SETTING.POINT";
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
					$scope.getPointsByDataSourceID($scope.currentDataSource);
				} else {
					var templateName = "SETTING.POINT";
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

	$scope.editPoint = function(point) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/datasource/point.model.html',
			controller: 'ModalEditPointCtrl',
			resolve: {
				params: function() {
					return {
						point: angular.copy(point)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedPoint) {
			modifiedPoint.data_source_id = $scope.currentDataSource;
			if(modifiedPoint.ratio==""){
				modifiedPoint.ratio = undefined;
			}
			PointService.editPoint(modifiedPoint, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "SETTING.POINT";
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
					$scope.getPointsByDataSourceID($scope.currentDataSource);
				} else {
					var templateName = "SETTING.POINT";
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

	$scope.deletePoint = function(point) {
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
					PointService.deletePoint(point, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "SETTING.POINT";
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
							$scope.getPointsByDataSourceID($scope.currentDataSource);
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
							var templateName = "SETTING.POINT";
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



	$scope.getAllDataSources();
	$scope.$on("handleBroadcastDataSourceChanged", function(event) {
		$scope.getAllDataSources();
	});

});


app.controller('ModalAddPointCtrl', function($scope, $uibModalInstance) {

	$scope.operation = "SETTING.ADD_POINT";
	$scope.point = {};
	$scope.point.object_type = "ENERGY_VALUE";
	$scope.point.is_trend = true;
	$scope.ok = function() {
		$uibModalInstance.close($scope.point);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditPointCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_POINT";
	$scope.point = params.point;

	$scope.ok = function() {
		$uibModalInstance.close($scope.point);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
