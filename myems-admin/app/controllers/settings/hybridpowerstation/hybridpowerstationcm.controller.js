'use strict';

app.controller('HybridPowerStationCMController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	HybridPowerStationService,
	HybridPowerStationCMService,
	DataSourceService,
	PointService,
	toaster,
	SweetAlert) {
      $scope.hybridpowerstations = [];
      $scope.hybridpowerstationcms = [];
	  $scope.points = [];
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

  	$scope.getHybridPowerStationCMsByHybridPowerStationID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		HybridPowerStationCMService.getHybridPowerStationCMsByHybridPowerStationID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.hybridpowerstationcms = response.data;
			} else {
          	$scope.hybridpowerstationcms=[];
        }
			});
  	};

  	$scope.changeHybridPowerStation=function(item,model){
    	$scope.currentHybridPowerStation=item;
    	$scope.currentHybridPowerStation.selected=model;
        $scope.is_show_add_hybridpowerstation_cm = true;
    	$scope.getHybridPowerStationCMsByHybridPowerStationID($scope.currentHybridPowerStation.id);
  	};

  	$scope.addHybridPowerStationCM = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationcm.model.html',
  			controller: 'ModalAddHybridPowerStationCMCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(hybridpowerstationcm) {

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			HybridPowerStationCMService.addHybridPowerStationCM($scope.currentHybridPowerStation.id, hybridpowerstationcm, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_CM")}),
  						showCloseButton: true,
  					});
  					$scope.getHybridPowerStationCMsByHybridPowerStationID($scope.currentHybridPowerStation.id);
            		$scope.$emit('handleEmitHybridPowerStationCMChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_CM")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editHybridPowerStationCM = function(hybridpowerstationcm) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationcm.model.html',
  			controller: 'ModalEditHybridPowerStationCMCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						hybridpowerstationcm: angular.copy(hybridpowerstationcm),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedHybridPowerStationCM) {

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			HybridPowerStationCMService.editHybridPowerStationCM($scope.currentHybridPowerStation.id, modifiedHybridPowerStationCM, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_CM")}),
  						showCloseButton: true,
  					});
  					$scope.getHybridPowerStationCMsByHybridPowerStationID($scope.currentHybridPowerStation.id);
            		$scope.$emit('handleEmitHybridPowerStationCMChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_CM")}),
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
	$scope.bindHybridPowerStationCMPoint = function(hybridpowerstationcm) {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/hybridpowerstation/hybridpowerstationcmpoint.model.html',
			controller: 'ModalBindHybridPowerStationCMCtrl',
			windowClass: "animated fadeIn",
				resolve: {
					params: function() {
						return {
							user_uuid: $scope.cur_user.uuid,
							token: $scope.cur_user.token,
							hybridpowerstationid: $scope.currentHybridPowerStation.id,
							hybridpowerstationcm: angular.copy(hybridpowerstationcm),
							meters: angular.copy($scope.meters),
							datasources: angular.copy($scope.datasources),
							points: angular.copy($scope.points),
						};
					}
				}
			});
		$rootScope.modalInstance = modalInstance;
	};

  	$scope.deleteHybridPowerStationCM = function(hybridpowerstationcm) {
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
  					HybridPowerStationCMService.deleteHybridPowerStationCM($scope.currentHybridPowerStation.id, hybridpowerstationcm.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_CM")}),
								showCloseButton: true,
							});
							$scope.getHybridPowerStationCMsByHybridPowerStationID($scope.currentHybridPowerStation.id);
							$scope.$emit('handleEmitHybridPowerStationCMChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("HYBRID_POWER_STATION.HYBRID_POWER_STATION_CM")}),
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
    $scope.$on('handleBroadcastHybridPowerStationChanged', function(event) {
      $scope.getAllHybridPowerStations();
  	});

  });


  app.controller('ModalAddHybridPowerStationCMCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "HYBRID_POWER_STATION.ADD_HYBRID_POWER_STATION_CM";
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.hybridpowerstationcm);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditHybridPowerStationCMCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "HYBRID_POWER_STATION.EDIT_HYBRID_POWER_STATION_CM";
  	$scope.hybridpowerstationcm = params.hybridpowerstationcm;
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.hybridpowerstationcm);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalBindHybridPowerStationCMCtrl', function(
	$scope,
	$uibModalInstance,
	toaster,
	$translate,
	HybridPowerStationCMService,
	PointService,
	params) {
	$scope.operation = "HYBRID_POWER_STATION.EDIT_HYBRID_POWER_STATION_CM";
	$scope.hybridpowerstationid = params.hybridpowerstationid;
	$scope.hybridpowerstationcm = params.hybridpowerstationcm;
	$scope.datasources=params.datasources;
	$scope.boundpoints=params.boundpoints;

	let headers = { "User-UUID": params.user_uuid, "Token": params.token };
	HybridPowerStationCMService.getPointsByCMID($scope.hybridpowerstationid, $scope.hybridpowerstationcm.id, headers, function (response) {
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
        HybridPowerStationCMService.addPair(params.hybridpowerstationid, params.hybridpowerstationcm.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				HybridPowerStationCMService.getPointsByCMID(params.hybridpowerstationid, params.hybridpowerstationcm.id, headers, function (response) {
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
        HybridPowerStationCMService.deletePair(params.hybridpowerstationid, params.hybridpowerstationcm.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				HybridPowerStationCMService.getPointsByCMID(params.hybridpowerstationid, params.hybridpowerstationcm.id, headers, function (response) {
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
