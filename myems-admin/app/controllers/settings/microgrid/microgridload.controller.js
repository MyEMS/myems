'use strict';

app.controller('MicrogridLoadController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridLoadService,
	MicrogridDataSourceService,
	PointService,
	MeterService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridloads = [];
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
  	$scope.getMicrogridLoadsByMicrogridID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		MicrogridLoadService.getMicrogridLoadsByMicrogridID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridloads = response.data;
			} else {
          	$scope.microgridloads=[];
        }
			});
  	};

  	$scope.changeMicrogrid=function(item,model){
    	$scope.currentMicrogrid=item;
    	$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_load = true;
    	$scope.getMicrogridLoadsByMicrogridID($scope.currentMicrogrid.id);
    	$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
        $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridLoad = function() {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridload.model.html',
  			controller: 'ModalAddMicrogridLoadCtrl',
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
  		modalInstance.result.then(function(microgridload) {
			microgridload.power_point_id = microgridload.power_point.id;
			microgridload.meter_id = microgridload.meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridLoadService.addMicrogridLoad($scope.currentMicrogrid.id, microgridload, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridLoadsByMicrogridID($scope.currentMicrogrid.id);
  					$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
                    $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridLoadChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editMicrogridLoad = function(microgridload) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridload.model.html',
  			controller: 'ModalEditMicrogridLoadCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridload: angular.copy(microgridload),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridLoad) {
			modifiedMicrogridLoad.power_point_id = modifiedMicrogridLoad.power_point.id;
			modifiedMicrogridLoad.meter_id = modifiedMicrogridLoad.meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridLoadService.editMicrogridLoad($scope.currentMicrogrid.id, modifiedMicrogridLoad, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridLoadsByMicrogridID($scope.currentMicrogrid.id);
  					$scope.getDataSourcesByMicrogridID($scope.currentMicrogrid.id);
                    $scope.getDataSourcePointsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridLoadChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
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

  	$scope.deleteMicrogridLoad = function(microgridload) {
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
  					MicrogridLoadService.deleteMicrogridLoad($scope.currentMicrogrid.id, microgridload.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
								showCloseButton: true,
							});
							$scope.getMicrogridLoadsByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridLoadChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

    $scope.bindMicrogridLoadPoint = function (load) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/microgrid/microgridloadpoint.model.html",
        controller: "ModalBindMicrogridLoadCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              microgridid: $scope.currentMicrogrid.id,
              microgridload: angular.copy(load),
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


  app.controller('ModalAddMicrogridLoadCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_LOAD";
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridLoadCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_LOAD";
  	$scope.microgridload = params.microgridload;
	$scope.points=params.points;
	$scope.meters=params.meters;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

app.controller(
  "ModalBindMicrogridLoadCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    MicrogridLoadService,
    PointService,
    params
  ) {
    $scope.operation = "MICROGRID.MICROGRID_LOAD";
    $scope.microgridid = params.microgridid;
    $scope.microgridload = params.microgridload;
    $scope.datasources = params.datasources;
    $scope.boundpoints = [];

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    MicrogridLoadService.getPointsByLoadID(
      $scope.microgridid,
      $scope.microgridload.id,
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
      MicrogridLoadService.addLoadPair(
        params.microgridid,
        params.microgridload.id,
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
            MicrogridLoadService.getPointsByLoadID(
              params.microgridid,
              params.microgridload.id,
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
      MicrogridLoadService.deleteLoadPair(
        params.microgridid,
        params.microgridload.id,
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
            MicrogridLoadService.getPointsByLoadID(
              params.microgridid,
              params.microgridload.id,
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