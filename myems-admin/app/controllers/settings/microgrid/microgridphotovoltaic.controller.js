'use strict';

app.controller('MicrogridPhotovoltaicController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridPhotovoltaicService,
	MicrogridDataSourceService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridphotovoltaics = [];
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
  	$scope.getMicrogridPhotovoltaicsByMicrogridID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		MicrogridPhotovoltaicService.getMicrogridPhotovoltaicsByMicrogridID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridphotovoltaics = response.data;
			} else {
          	$scope.microgridphotovoltaics=[];
        }
			});
  	};

  	$scope.changeMicrogrid=function(item,model){
    	$scope.currentMicrogrid=item;
    	$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_photovoltaic = true;
    	$scope.getMicrogridPhotovoltaicsByMicrogridID($scope.currentMicrogrid.id);
    	$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
        $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridPhotovoltaic = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridphotovoltaic.model.html',
  			controller: 'ModalAddMicrogridPhotovoltaicCtrl',
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
  		modalInstance.result.then(function(microgridphotovoltaic) {
			microgridphotovoltaic.power_point_id = microgridphotovoltaic.power_point.id;
			microgridphotovoltaic.meter_id = microgridphotovoltaic.meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridPhotovoltaicService.addMicrogridPhotovoltaic($scope.currentMicrogrid.id, microgridphotovoltaic, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridPhotovoltaicsByMicrogridID($scope.currentMicrogrid.id);
  					$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
                    $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridPhotovoltaicChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editMicrogridPhotovoltaic = function(microgridphotovoltaic) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridphotovoltaic.model.html',
  			controller: 'ModalEditMicrogridPhotovoltaicCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridphotovoltaic: angular.copy(microgridphotovoltaic),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridPhotovoltaic) {
			modifiedMicrogridPhotovoltaic.power_point_id = modifiedMicrogridPhotovoltaic.power_point.id;
			modifiedMicrogridPhotovoltaic.meter_id = modifiedMicrogridPhotovoltaic.meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridPhotovoltaicService.editMicrogridPhotovoltaic($scope.currentMicrogrid.id, modifiedMicrogridPhotovoltaic, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridPhotovoltaicsByMicrogridID($scope.currentMicrogrid.id);
  					$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
                    $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridPhotovoltaicChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
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

  	$scope.deleteMicrogridPhotovoltaic = function(microgridphotovoltaic) {
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
  					MicrogridPhotovoltaicService.deleteMicrogridPhotovoltaic($scope.currentMicrogrid.id, microgridphotovoltaic.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
								showCloseButton: true,
							});
							$scope.getMicrogridPhotovoltaicsByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridPhotovoltaicChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

    $scope.bindMicrogridPhotovoltaicPoint = function (photovoltaic) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/microgrid/microgridphotovoltaicpoint.model.html",
        controller: "ModalBindMicrogridPhotovoltaicCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              microgridid: $scope.currentMicrogrid.id,
              microgridphotovoltaic: angular.copy(photovoltaic),
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


  app.controller('ModalAddMicrogridPhotovoltaicCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_PHOTOVOLTAIC";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridphotovoltaic);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridPhotovoltaicCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_PHOTOVOLTAIC";
  	$scope.microgridphotovoltaic = params.microgridphotovoltaic;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridphotovoltaic);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

app.controller(
  "ModalBindMicrogridPhotovoltaicCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    MicrogridPhotovoltaicService,
    PointService,
    params
  ) {
    $scope.operation = "MICROGRID.MICROGRID_PHOTOVOLTAIC";
    $scope.microgridid = params.microgridid;
    $scope.microgridphotovoltaic = params.microgridphotovoltaic;
    $scope.datasources = params.datasources;
    $scope.boundpoints = [];

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    MicrogridPhotovoltaicService.getPointsByPhotovoltaicID(
      $scope.microgridid,
      $scope.microgridphotovoltaic.id,
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
      MicrogridPhotovoltaicService.addPhotovoltaicPair(
        params.microgridid,
        params.microgridphotovoltaic.id,
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
            MicrogridPhotovoltaicService.getPointsByPhotovoltaicID(
              params.microgridid,
              params.microgridphotovoltaic.id,
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
      MicrogridPhotovoltaicService.deletePhotovoltaicPair(
        params.microgridid,
        params.microgridphotovoltaic.id,
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
            MicrogridPhotovoltaicService.getPointsByPhotovoltaicID(
              params.microgridid,
              params.microgridphotovoltaic.id,
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
