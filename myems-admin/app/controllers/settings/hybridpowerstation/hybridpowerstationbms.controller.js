'use strict';

app.controller('HybridPowerStationBMSController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	HybridPowerStationService,
	HybridPowerStationBMSService,
	DataSourceService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
		$scope.hybridpowerstations = [];
		$scope.hybridpowerstationbmses = [];
		$scope.datasources = [];
		$scope.points = [];
		$scope.boundpoints = [];
		$scope.meters = [];
		$scope.currentHybridPowerStation = null;
		$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

		$scope.getAllHybridPowerStations = function() {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			HybridPowerStationService.getAllHybridPowerStations(headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.hybridpowerstations = response.data;
				} else {
					$scope.hybridpowerstations = [];
				}
			});
		};

		$scope.getAllDataSources = function() {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			DataSourceService.getAllDataSources(headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.datasources = response.data;
					if ($scope.datasources.length > 0) {
						$scope.currentDataSource = $scope.datasources[0].id;
						$scope.getPointsByDataSourceID($scope.currentDataSource);
					}
				} else {
					$scope.datasources = [];
				}
			});
		};

		$scope.getAllPoints = function() {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			PointService.getAllPoints(headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.points = response.data;
				} else {
					$scope.points = [];
				}
			});
		};

		$scope.getPointsByDataSourceID = function(id) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			PointService.getPointsByDataSourceID(id, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.points = response.data;
				} else {
					$scope.points = [];
				}
			});
		};

		$scope.getAllMeters = function() {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			MeterService.getAllMeters(headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.meters = response.data;
				} else {
					$scope.meters = [];
				}
			});
		};

		$scope.getHybridPowerStationBMSesByHybridPowerStationID = function(id) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			HybridPowerStationBMSService.getHybridPowerStationBMSesByHybridPowerStationID(id, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.hybridpowerstationbmses = response.data;
				} else {
				$scope.hybridpowerstationbmses=[];
			}
				});
		};

		$scope.changeHybridPowerStation=function(item,model){
			$scope.currentHybridPowerStation=item;
			$scope.currentHybridPowerStation.selected=model;
			$scope.is_show_add_hybridpowerstation_bms = true;
			$scope.getHybridPowerStationBMSesByHybridPowerStationID($scope.currentHybridPowerStation.id);
		};

		$scope.addHybridPowerStationBMS = function() {
			var modalInstance = $uibModal.open({
				templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationbms.model.html',
				controller: 'ModalAddHybridPowerStationBMSCtrl',
				windowClass: "animated fadeIn",
				resolve: {
					params: function() {
						return {
							meters: angular.copy($scope.meters),
							datasources: angular.copy($scope.datasources),
							points: angular.copy($scope.points),
						};
					}
				}
			});
			modalInstance.result.then(function(hybridpowerstationbms) {
				hybridpowerstationbms.operating_status_point_id = hybridpowerstationbms.operating_status_point.id;
				hybridpowerstationbms.soc_point_id = hybridpowerstationbms.soc_point.id;

				let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
				HybridPowerStationBMSService.addHybridPowerStationBMS($scope.currentHybridPowerStation.id, hybridpowerstationbms, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 201) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_bms")}),
							showCloseButton: true,
						});
						$scope.getHybridPowerStationBMSesByHybridPowerStationID($scope.currentHybridPowerStation.id);
						$scope.$emit('handleEmitHybridPowerStationBMSChanged');
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_bms")}),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}, function() {

			});
			$rootScope.modalInstance = modalInstance;
		};

		$scope.editHybridPowerStationBMS = function(hybridpowerstationbms) {
			var modalInstance = $uibModal.open({
				templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationbms.model.html',
				controller: 'ModalEditHybridPowerStationBMSCtrl',
				windowClass: "animated fadeIn",
				resolve: {
					params: function() {
						return {
							hybridpowerstationbms: angular.copy(hybridpowerstationbms),
							meters: angular.copy($scope.meters),
							datasources: angular.copy($scope.datasources),
							points: angular.copy($scope.points),
						};
					}
				}
			});

			modalInstance.result.then(function(modifiedHybridPowerStationBMS) {
				modifiedHybridPowerStationBMS.operating_status_point_id = modifiedHybridPowerStationBMS.operating_status_point.id;
				modifiedHybridPowerStationBMS.soc_point_id = modifiedHybridPowerStationBMS.soc_point.id;

				let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
				HybridPowerStationBMSService.editHybridPowerStationBMS($scope.currentHybridPowerStation.id, modifiedHybridPowerStationBMS, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 200) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_bms")}),
							showCloseButton: true,
						});
						$scope.getHybridPowerStationBMSesByHybridPowerStationID($scope.currentHybridPowerStation.id);
						$scope.$emit('handleEmitHybridPowerStationBMSChanged');
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_bms")}),
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
		$scope.bindHybridPowerStationBMSPoint = function(hybridpowerstationbms) {
			var modalInstance = $uibModal.open({
				templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationbmspoint.model.html',
				controller: 'ModalBindHybridPowerStationBMSCtrl',
				windowClass: "animated fadeIn",
					resolve: {
						params: function() {
							return {
								user_uuid: $scope.cur_user.uuid,
								token: $scope.cur_user.token,
								hybridpowerstationid: $scope.currentHybridPowerStation.id,
								hybridpowerstationbms: angular.copy(hybridpowerstationbms),
								meters: angular.copy($scope.meters),
								datasources: angular.copy($scope.datasources),
								points: angular.copy($scope.points),
							};
						}
					}
				});
			$rootScope.modalInstance = modalInstance;
		};
		$scope.deleteHybridPowerStationBMS = function(hybridpowerstationbms) {
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
						HybridPowerStationBMSService.deleteHybridPowerStationBMS($scope.currentHybridPowerStation.id, hybridpowerstationbms.id, headers, function (response) {
							if (angular.isDefined(response.status) && response.status === 204) {
								toaster.pop({
									type: "success",
									title: $translate.instant("TOASTER.SUCCESS_TITLE"),
									body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_bms")}),
									showCloseButton: true,
								});
								$scope.getHybridPowerStationBMSesByHybridPowerStationID($scope.currentHybridPowerStation.id);
								$scope.$emit('handleEmitHybridPowerStationBMSChanged');
							} else {
								toaster.pop({
									type: "error",
									title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_bms")}),
									body: $translate.instant(response.data.description),
									showCloseButton: true,
								});
							}
						});
					}
				});
		};

		$scope.getAllHybridPowerStations();
		$scope.getAllDataSources();
		$scope.getAllPoints();
		$scope.getAllMeters();

		$scope.$on('handleBroadcastHybridPowerStationChanged', function(event) {
			$scope.getAllHybridPowerStations();
		});

});

app.controller('ModalAddHybridPowerStationBMSCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "HYBRID_POWER_STATION.ADD_HYBRID_POWER_STATION_bms";
	$scope.datasources=params.datasources;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.hybridpowerstationbms);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
});

app.controller('ModalEditHybridPowerStationBMSCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "HYBRID_POWER_STATION.EDIT_HYBRID_POWER_STATION_bms";
  	$scope.hybridpowerstationbms = params.hybridpowerstationbms;
	$scope.datasources=params.datasources;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.hybridpowerstationbms);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
});

app.controller('ModalBindHybridPowerStationBMSCtrl', function(
	$scope,
	$uibModalInstance,
	toaster,
	$translate,
	HybridPowerStationBMSService,
	PointService,
	params) {
	$scope.operation = "HYBRID_POWER_STATION.EDIT_HYBRID_POWER_STATION_bms";
	$scope.hybridpowerstationid = params.hybridpowerstationid;
	$scope.hybridpowerstationbms = params.hybridpowerstationbms;
	$scope.datasources=params.datasources;
	$scope.boundpoints=params.boundpoints;

	let headers = { "User-UUID": params.user_uuid, "Token": params.token };
	HybridPowerStationBMSService.getPointsByBMSID($scope.hybridpowerstationid, $scope.hybridpowerstationbms.id, headers, function (response) {
		if (angular.isDefined(response.status) && response.status === 200) {
			$scope.boundpoints = response.data;
		} else {
			$scope.boundpoints = [];
		}
	});

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

    $scope.changeDataSource = function (item, model) {
		console.log('changeDataSource');
        $scope.currentDataSource = model;
		console.log($scope.currentDataSource);
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getPointsByDataSourceID = function(id) {
		console.log('getPointsByDataSourceID');
		let headers = { "User-UUID": params.user_uuid, "Token": params.token };
        PointService.getPointsByDataSourceID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.points = response.data;
            } else {
                $scope.points = [];
            }
        });
    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
		let headers = { "User-UUID": params.user_uuid, "Token": params.token };
        HybridPowerStationBMSService.addPair(params.hybridpowerstationid, params.hybridpowerstationbms.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				HybridPowerStationBMSService.getPointsByBMSID(params.hybridpowerstationid, params.hybridpowerstationbms.id, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 200) {
						$scope.boundpoints = response.data;
					} else {
						$scope.boundpoints = [];
					}
				});
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.deletePointPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }

		var pointid  = angular.element('#' + dragEl).scope().boundpoint.id;
		let headers = { "User-UUID": params.user_uuid, "Token": params.token };
        HybridPowerStationBMSService.deletePair(params.hybridpowerstationid, params.hybridpowerstationbms.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				HybridPowerStationBMSService.getPointsByBMSID(params.hybridpowerstationid, params.hybridpowerstationbms.id, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 200) {
						$scope.boundpoints = response.data;
					} else {
						$scope.boundpoints = [];
					}
				});
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

});
