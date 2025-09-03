'use strict';

app.controller('MicrogridHeatpumpController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridHeatpumpService,
	MicrogridDataSourceService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridheatpumps = [];
	  $scope.points = [];
	  $scope.meters = [];
      $scope.currentMicrogrid = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.getAllMicrogrids = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		MicrogridService.getAllMicrogrids(headers, function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.microgrids = response.data;
  			} else {
  				$scope.microgrids = [];
  			}
  		});
  	};

    $scope.getDataSourcesByMicrogridID = function(id) {
      let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
      MicrogridDataSourceService.getDataSourcesByMicrogridID(id, headers, function(response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.datasources = response.data;
        } else {
          $scope.datasources = [];
        }
      });
    };

    $scope.getDataSourcePointsByMicrogridID = function(id) {
      let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
      MicrogridDataSourceService.getDataSourcePointsByMicrogridID(id, headers, function(response) {
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
  	$scope.getMicrogridHeatpumpsByMicrogridID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		MicrogridHeatpumpService.getMicrogridHeatpumpsByMicrogridID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridheatpumps = response.data;
			} else {
          	$scope.microgridheatpumps=[];
        }
			});
  	};

  	$scope.changeMicrogrid=function(item,model){
    	$scope.currentMicrogrid=item;
    	$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_heatpump = true;
    	$scope.getMicrogridHeatpumpsByMicrogridID($scope.currentMicrogrid.id);
    	$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
        $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridHeatpump = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridheatpump.model.html',
  			controller: 'ModalAddMicrogridHeatpumpCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridheatpump) {
			microgridheatpump.power_point_id = microgridheatpump.power_point.id;
			microgridheatpump.electricity_meter_id = microgridheatpump.electricity_meter.id;
			microgridheatpump.heat_meter_id = microgridheatpump.heat_meter.id;
			microgridheatpump.cooling_meter_id = microgridheatpump.cooling_meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridHeatpumpService.addMicrogridHeatpump($scope.currentMicrogrid.id, microgridheatpump, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_HEATPUMP")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridHeatpumpsByMicrogridID($scope.currentMicrogrid.id);
  					$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
                    $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridHeatpumpChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_HEATPUMP")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editMicrogridHeatpump = function(microgridheatpump) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridheatpump.model.html',
  			controller: 'ModalEditMicrogridHeatpumpCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridheatpump: angular.copy(microgridheatpump),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridHeatpump) {
			modifiedMicrogridHeatpump.power_point_id = modifiedMicrogridHeatpump.power_point.id;
			modifiedMicrogridHeatpump.electricity_meter_id = modifiedMicrogridHeatpump.electricity_meter.id;
			modifiedMicrogridHeatpump.heat_meter_id = modifiedMicrogridHeatpump.heat_meter.id;
			modifiedMicrogridHeatpump.cooling_meter_id = modifiedMicrogridHeatpump.cooling_meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridHeatpumpService.editMicrogridHeatpump($scope.currentMicrogrid.id, modifiedMicrogridHeatpump, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_HEATPUMP")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridHeatpumpsByMicrogridID($scope.currentMicrogrid.id);
  					$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
                    $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridHeatpumpChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_HEATPUMP")}),
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

  	$scope.deleteMicrogridHeatpump = function(microgridheatpump) {
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
  					MicrogridHeatpumpService.deleteMicrogridHeatpump($scope.currentMicrogrid.id, microgridheatpump.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_HEATPUMP")}),
								showCloseButton: true,
							});
							$scope.getMicrogridHeatpumpsByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridHeatpumpChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_HEATPUMP")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

    $scope.bindMicrogridHeatPumpPoint = function (heatpump) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/microgrid/microgridheatpumppoint.model.html",
        controller: "ModalBindMicrogridHeatPumpCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              microgridid: $scope.currentMicrogrid.id,
              microgridheatpump: angular.copy(heatpump),
              meters: angular.copy($scope.meters),
              datasources: angular.copy($scope.datasources),
              points: angular.copy($scope.points),
            };
          },
        },
      });
      $rootScope.modalInstance = modalInstance;
    };

  	$scope.getAllMicrogrids();
	$scope.getAllMeters();
    $scope.$on('handleBroadcastMicrogridChanged', function(event) {
      $scope.getAllMicrogrids();
  	});

  });


  app.controller('ModalAddMicrogridHeatpumpCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_HEATPUMP";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridheatpump);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridHeatpumpCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_HEATPUMP";
  	$scope.microgridheatpump = params.microgridheatpump;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridheatpump);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller(
  "ModalBindMicrogridHeatPumpCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    MicrogridHeatpumpService,
    PointService,
    params
  ) {
    $scope.operation = "MICROGRID.MICROGRID_HEATPUMP";
    $scope.microgridid = params.microgridid;
    $scope.microgridheatpump = params.microgridheatpump;
    $scope.datasources = params.datasources;
    $scope.boundpoints = [];

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    MicrogridHeatpumpService.getPointsByHeatPumpID(
      $scope.microgridid,
      $scope.microgridheatpump.id,
      headers,
      function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.boundpoints = response.data;
        } else {
          $scope.boundpoints = [];
        }
      }
    );

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };

    $scope.changeDataSource = function (item, model) {
      $scope.currentDataSource = model;
      $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getPointsByDataSourceID = function (id) {
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      PointService.getPointsByDataSourceID(id, headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.points = response.data;
        } else {
          $scope.points = [];
        }
      });
    };

    $scope.pairPoint = function (dragEl, dropEl) {
      var pointid = angular.element("#" + dragEl).scope().point.id;
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      MicrogridHeatpumpService.addHeatPumpPair(
        params.microgridid,
        params.microgridheatpump.id,
        pointid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
              showCloseButton: true,
            });
            let headers = {
              "User-UUID": params.user_uuid,
              Token: params.token,
            };
            MicrogridHeatpumpService.getPointsByHeatPumpID(
              params.microgridid,
              params.microgridheatpump.id,
              headers,
              function (response) {
                if (
                  angular.isDefined(response.status) &&
                  response.status === 200
                ) {
                  $scope.boundpoints = response.data;
                } else {
                  $scope.boundpoints = [];
                }
              }
            );
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };

    $scope.deletePointPair = function (dragEl, dropEl) {
      if (angular.element("#" + dragEl).hasClass("source")) {
        return;
      }

      var pointid = angular.element("#" + dragEl).scope().boundpoint.id;
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      MicrogridHeatpumpService.deleteHeatPumpPair(
        params.microgridid,
        params.microgridheatpump.id,
        pointid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
              showCloseButton: true,
            });
            let headers = {
              "User-UUID": params.user_uuid,
              Token: params.token,
            };
            MicrogridHeatpumpService.getPointsByHeatPumpID(
              params.microgridid,
              params.microgridheatpump.id,
              headers,
              function (response) {
                if (
                  angular.isDefined(response.status) &&
                  response.status === 200
                ) {
                  $scope.boundpoints = response.data;
                } else {
                  $scope.boundpoints = [];
                }
              }
            );
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };
  }
);
