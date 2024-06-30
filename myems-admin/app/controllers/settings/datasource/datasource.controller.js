'use strict';

app.controller('DataSourceController', function(
	$scope,
	$rootScope,
	$window,
	$uibModal,
	$translate,
	DataSourceService,
	GatewayService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

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

	$scope.getAllProtocols = function() {
		$scope.protocols = [
			{"id":"modbus-tcp", "name": "Modbus TCP"},
			{"id":"bacnet-ip", "name": "BACnet/IP"},
			{"id":"cassandra", "name": "Cassandra"},
			{"id":"clickhouse", "name": "ClickHouse"},
			{"id":"coap", "name": "CoAP"},
			{"id":"controllogix", "name": "ControlLogix"},
			{"id":"dlt645", "name": "DL/T645"},
			{"id":"dtu-rtu", "name": "DTU-RTU"},
			{"id":"dtu-tcp", "name": "DTU-TCP"},
			{"id":"dtu-mqtt", "name": "DTU-MQTT"},
			{"id":"elexon-bmrs", "name": "Elexon BMRS"},
			{"id":"iec104", "name": "IEC104"},
			{"id":"influxdb", "name": "InfluxDB"},
			{"id":"modbus-rtu", "name": "Modbus RTU"},
			{"id":"mongodb", "name": "MongoDB"},
			{"id":"mqtt-acrel", "name": "MQTT ACREL"},
			{"id":"mqtt-adw300", "name": "MQTT ADW300"},
			{"id":"mqtt-huiju", "name": "MQTT HUIJU"},
			{"id":"mqtt-md4220", "name": "MQTT MD4220"},
			{"id":"mqtt-seg", "name": "MQTT SEG"},
			{"id":"mqtt-weilan", "name": "MQTT WEILAN"},
			{"id":"mqtt-xintianli", "name": "MQTT XINTIANLI"},
			{"id":"mqtt-zhongxian", "name": "MQTT ZHONGXIAN"},
			{"id":"mqtt", "name": "MQTT"},
			{"id":"mysql", "name": "MySQL"},
			{"id":"opc-ua", "name": "OPC-UA"},
			{"id":"oracle", "name": "Oracle"},
			{"id":"postgresql", "name": "PostgreSQL"},
			{"id":"profibus", "name": "PROFIBUS"},
			{"id":"profinet", "name": "PROFINET"},
			{"id":"s7", "name": "S7"},
			{"id":"simulation", "name": "Simulation"},
			{"id":"sqlserver", "name": "SQL Server"},
			{"id":"tdengine", "name": "TDengine"},
			{"id":"weather", "name": "Weather"}
		];
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
						protocols: angular.copy($scope.protocols),
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
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("COMMON.DATA_SOURCE")}),
						showCloseButton: true,
					});

					$scope.$emit("handleEmitDataSourceChanged");
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.DATA_SOURCE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
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
						protocols: angular.copy($scope.protocols),
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
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.DATA_SOURCE")}),
						showCloseButton: true,
					});
					$scope.$emit("handleEmitDataSourceChanged");
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.DATA_SOURCE")}),
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
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.DATA_SOURCE")}),
                                showCloseButton: true,
                            });
							$scope.$emit("handleEmitDataSourceChanged");
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.DATA_SOURCE")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.exportDataSource = function(datasource) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		DataSourceService.exportDataSource(datasource, headers, function(response) {
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

	$scope.cloneDataSource = function(datasource){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		DataSourceService.cloneDataSource(datasource, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.DATA_SOURCE")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitDataSourceChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.DATA_SOURCE")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importDataSource = function() {
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
			DataSourceService.importDataSource(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.DATA_SOURCE")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitDataSourceChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.DATA_SOURCE") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};



	$scope.getAllDataSources();
	$scope.getAllGateways();
	$scope.getAllProtocols();
	$scope.$on("handleBroadcastDataSourceChanged", function(event) {
		$scope.getAllDataSources();
	});

});


app.controller('ModalAddDataSourceCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "DATA_SOURCE.ADD_DATA_SOURCE";
	$scope.gateways = params.gateways;
	$scope.protocols = params.protocols;
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
	$scope.protocols = params.protocols;
	$scope.disable = false;
	$scope.datasource = params.datasource;

	$scope.ok = function() {
		$uibModalInstance.close($scope.datasource);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
