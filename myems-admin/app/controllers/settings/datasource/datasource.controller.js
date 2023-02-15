'use strict';

app.controller('DataSourceController', function(
	$scope, 
	$window,
	$uibModal, 
	$translate, 
	DataSourceService, 
	GatewayService, 
	toaster, 
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllDataSources = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		DataSourceService.getAllDataSources(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.datasources = response.data;
			} else {
				$scope.datasources = [];
			}
		});

	};

	$scope.getAllGateways = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		GatewayService.getAllGateways(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.gateways = response.data;
			} else {
				$scope.gateways = [];
			}
		});

	};

	$scope.addDataSource = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/datasource/datasource.model.html',
			controller: 'ModalAddDataSourceCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						gateways: angular.copy($scope.gateways),
					};
				}
			}
		});
		modalInstance.result.then(function(datasource) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			datasource.gateway_id = datasource.gateway.id;
			DataSourceService.addDataSource(datasource, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("DATA_SOURCE.DATA_SOURCE")}),
						showCloseButton: true,
					});

					$scope.$emit("handleEmitDataSourceChanged");
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("DATA_SOURCE.DATA_SOURCE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editDataSource = function(datasource) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/datasource/datasource.model.html',
			controller: 'ModalEditDataSourceCtrl',
			resolve: {
				params: function() {
					return {
						datasource: angular.copy(datasource),
						gateways: angular.copy($scope.gateways),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedDataSource) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			modifiedDataSource.gateway_id = modifiedDataSource.gateway.id;
			DataSourceService.editDataSource(modifiedDataSource, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("DATA_SOURCE.DATA_SOURCE")}),
						showCloseButton: true,
					});
					$scope.$emit("handleEmitDataSourceChanged");
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("DATA_SOURCE.DATA_SOURCE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
	};

	$scope.deleteDataSource = function(datasource) {
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
					DataSourceService.deleteDataSource(datasource, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("DATA_SOURCE.DATA_SOURCE")}),
                                showCloseButton: true,
                            });
							$scope.$emit("handleEmitDataSourceChanged");
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("DATA_SOURCE.DATA_SOURCE")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};



	$scope.getAllDataSources();
	$scope.getAllGateways();
	$scope.$on("handleBroadcastDataSourceChanged", function(event) {
		$scope.getAllDataSources();
	});

});


app.controller('ModalAddDataSourceCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "DATA_SOURCE.ADD_DATA_SOURCE";
	$scope.gateways = params.gateways;
	$scope.disable = false;
	$scope.ok = function() {
		$uibModalInstance.close($scope.datasource);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditDataSourceCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "DATA_SOURCE.EDIT_DATA_SOURCE";
	$scope.gateways = params.gateways;
	$scope.disable = false;
	$scope.datasource = params.datasource;

	$scope.ok = function() {
		$uibModalInstance.close($scope.datasource);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
