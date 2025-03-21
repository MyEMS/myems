'use strict';

app.controller('HybridPowerStationPCSController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	HybridPowerStationService,
	HybridPowerStationPCSService,
	DataSourceService,
	PointService,
	MeterService,
	CommandService,
	toaster,
	SweetAlert) {
      $scope.hybridpowerstations = [];
      $scope.hybridpowerstationpcses = [];
	  $scope.meters = [];
	  $scope.points = [];
	  $scope.commands = [];
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

	$scope.getAllCommands = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CommandService.getAllCommands(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.commands = response.data;
			} else {
				$scope.commands = [];
			}
		});
	};
  	$scope.getHybridPowerStationPCSesByHybridPowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		HybridPowerStationPCSService.getHybridPowerStationPCSesByHybridPowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.hybridpowerstationpcses = response.data;
			} else {
          		$scope.hybridpowerstationpcses=[];
        	}
		});
  	};

  	$scope.changeHybridPowerStation=function(item,model){
    	$scope.currentHybridPowerStation=item;
    	$scope.currentHybridPowerStation.selected=model;
        $scope.is_show_add_hybridpowerstation_pcs = true;
    	$scope.getHybridPowerStationPCSesByHybridPowerStationID($scope.currentHybridPowerStation.id);
  	};

  	$scope.addHybridPowerStationPCS = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationpcs.model.html',
  			controller: 'ModalAddHybridPowerStationPCSCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
						commands: angular.copy($scope.commands),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(hybridpowerstationpcs) {
			hybridpowerstationpcs.operating_status_point_id = hybridpowerstationpcs.operating_status_point.id;
			hybridpowerstationpcs.charge_meter_id = hybridpowerstationpcs.charge_meter.id;
			hybridpowerstationpcs.discharge_meter_id = hybridpowerstationpcs.discharge_meter.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			HybridPowerStationPCSService.addHybridPowerStationPCS($scope.currentHybridPowerStation.id, hybridpowerstationpcs, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_PPCS")}),
  						showCloseButton: true,
  					});
  					$scope.getHybridPowerStationPCSesByHybridPowerStationID($scope.currentHybridPowerStation.id);
            		$scope.$emit('handleEmitHybridPowerStationPCSChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_PPCS")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

	$scope.bindHybridPowerStationPCSPoint = function(hybridpowerstationpcs) {
	var modalInstance = $uibModal.open({
		templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationpcspoint.model.html',
		controller: 'ModalBindHybridPowerStationPCSCtrl',
		windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						user_uuid: $scope.cur_user.uuid,
						token: $scope.cur_user.token,
						hybridpowerstationid: $scope.currentHybridPowerStation.id,
						hybridpowerstationpcs: angular.copy(hybridpowerstationpcs),
						meters: angular.copy($scope.meters),
						datasources: angular.copy($scope.datasources),
						points: angular.copy($scope.points),
					};
				}
			}
		});
		$rootScope.modalInstance = modalInstance;
	};
  	$scope.editHybridPowerStationPCS = function(hybridpowerstationpcs) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationpcs.model.html',
  			controller: 'ModalEditHybridPowerStationPCSCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						hybridpowerstationpcs: angular.copy(hybridpowerstationpcs),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
						commands: angular.copy($scope.commands),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedHybridPowerStationPCS) {
			modifiedHybridPowerStationPCS.operating_status_point_id = modifiedHybridPowerStationPCS.operating_status_point.id;
			modifiedHybridPowerStationPCS.charge_meter_id = modifiedHybridPowerStationPCS.charge_meter.id;
			modifiedHybridPowerStationPCS.discharge_meter_id = modifiedHybridPowerStationPCS.discharge_meter.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			HybridPowerStationPCSService.editHybridPowerStationPCS($scope.currentHybridPowerStation.id, modifiedHybridPowerStationPCS, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_PPCS")}),
  						showCloseButton: true,
  					});
  					$scope.getHybridPowerStationPCSesByHybridPowerStationID($scope.currentHybridPowerStation.id);
            		$scope.$emit('handleEmitHybridPowerStationPCSChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_PPCS")}),
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

  	$scope.deleteHybridPowerStationPCS = function(hybridpowerstationpcs) {
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
  					HybridPowerStationPCSService.deleteHybridPowerStationPCS($scope.currentHybridPowerStation.id, hybridpowerstationpcs.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_PPCS")}),
								showCloseButton: true,
							});
							$scope.getHybridPowerStationPCSesByHybridPowerStationID($scope.currentHybridPowerStation.id);
							$scope.$emit('handleEmitHybridPowerStationPCSChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_PPCS")}),
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
	$scope.getAllCommands();
    $scope.$on('handleBroadcastHybridPowerStationChanged', function(event) {
      $scope.getAllHybridPowerStations();
  	});

  });


  app.controller('ModalAddHybridPowerStationPCSCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "HYBRID_POWER_STATION.ADD_HYBRID_POWER_STATION_PPCS";
	$scope.points=params.points;
	$scope.meters=params.meters;
	$scope.commands=params.commands;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.hybridpowerstationpcs);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditHybridPowerStationPCSCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "HYBRID_POWER_STATION.EDIT_HYBRID_POWER_STATION_PPCS";
  	$scope.hybridpowerstationpcs = params.hybridpowerstationpcs;
	$scope.points=params.points;
	$scope.meters=params.meters;
	$scope.commands=params.commands;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.hybridpowerstationpcs);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });


  app.controller('ModalBindHybridPowerStationPCSCtrl', function(
	$scope,
	$uibModalInstance,
	toaster,
	$translate,
	HybridPowerStationPCSService,
	PointService,
	params) {
	$scope.operation = "HYBRID_POWER_STATION.EDIT_HYBRID_POWER_STATION_PPCS";
	$scope.hybridpowerstationid = params.hybridpowerstationid;
	$scope.hybridpowerstationpcs = params.hybridpowerstationpcs;
	$scope.datasources=params.datasources;
	$scope.boundpoints=params.boundpoints;

	let headers = { "User-UUID": params.user_uuid, "Token": params.token };
	HybridPowerStationPCSService.getPointsByPCSID($scope.hybridpowerstationid, $scope.hybridpowerstationpcs.id, headers, function (response) {
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
        HybridPowerStationPCSService.addPair(params.hybridpowerstationid, params.hybridpowerstationpcs.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				HybridPowerStationPCSService.getPointsByPCSID(params.hybridpowerstationid, params.hybridpowerstationpcs.id, headers, function (response) {
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
        HybridPowerStationPCSService.deletePair(params.hybridpowerstationid, params.hybridpowerstationpcs.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				HybridPowerStationPCSService.getPointsByPCSID(params.hybridpowerstationid, params.hybridpowerstationpcs.id, headers, function (response) {
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
