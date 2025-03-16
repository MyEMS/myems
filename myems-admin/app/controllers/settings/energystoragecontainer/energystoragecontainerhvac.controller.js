'use strict';

app.controller('EnergyStorageContainerHVACController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerHVACService,
	DataSourceService,
	PointService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerhvacs = [];
	  $scope.points = [];
      $scope.currentEnergyStorageContainer = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.getAllEnergyStorageContainers = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerService.getAllEnergyStorageContainers(headers, function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.energystoragecontainers = response.data;
  			} else {
  				$scope.energystoragecontainers = [];
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

  	$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerHVACService.getEnergyStorageContainerHVACsByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerhvacs = response.data;
			} else {
          	    $scope.energystoragecontainerhvacs=[];
            }
		});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_hvac = true;
    	$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerHVAC = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerhvac.model.html',
  			controller: 'ModalAddEnergyStorageContainerHVACCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energystoragecontainerhvac) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerHVACService.addEnergyStorageContainerHVAC($scope.currentEnergyStorageContainer.id, energystoragecontainerhvac, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerHVACChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerHVAC = function(energystoragecontainerhvac) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerhvac.model.html',
  			controller: 'ModalEditEnergyStorageContainerHVACCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerhvac: angular.copy(energystoragecontainerhvac),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerHVAC) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerHVACService.editEnergyStorageContainerHVAC($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerHVAC, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerHVACChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
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

	$scope.bindEnergyStorageContainerHVACPoint = function(energystoragecontainerhvac) {
	var modalInstance = $uibModal.open({
		templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerhvacpoint.model.html',
		controller: 'ModalBindEnergyStorageContainerHVACCtrl',
		windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						user_uuid: $scope.cur_user.uuid,
						token: $scope.cur_user.token,
						energystoragecontainerid: $scope.currentEnergyStorageContainer.id,
						energystoragecontainerhvac: angular.copy(energystoragecontainerhvac),
						meters: angular.copy($scope.meters),
						datasources: angular.copy($scope.datasources),
						points: angular.copy($scope.points),
					};
				}
			}
		});
		$rootScope.modalInstance = modalInstance;
	};
  	$scope.deleteEnergyStorageContainerHVAC = function(energystoragecontainerhvac) {
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
  					EnergyStorageContainerHVACService.deleteEnergyStorageContainerHVAC($scope.currentEnergyStorageContainer.id, energystoragecontainerhvac.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerHVACsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerHVACChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_HVAC")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

  	$scope.getAllEnergyStorageContainers();
	$scope.getAllDataSources();
	$scope.getAllPoints();
    $scope.$on('handleBroadcastEnergyStorageContainerChanged', function(event) {
      $scope.getAllEnergyStorageContainers();
  	});

  });


  app.controller('ModalAddEnergyStorageContainerHVACCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_HVAC";
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerhvac);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerHVACCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_HVAC";
  	$scope.energystoragecontainerhvac = params.energystoragecontainerhvac;
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerhvac);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalBindEnergyStorageContainerHVACCtrl', function(
	$scope,
	$uibModalInstance,
	toaster,
	$translate,
	EnergyStorageContainerHVACService,
	PointService,
	params) {
	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_HVAC";
	$scope.energystoragecontainerid = params.energystoragecontainerid;
	$scope.energystoragecontainerhvac = params.energystoragecontainerhvac;
	$scope.datasources=params.datasources;
	$scope.boundpoints=params.boundpoints;

	let headers = { "User-UUID": params.user_uuid, "Token": params.token };
	EnergyStorageContainerHVACService.getPointsByHVACID($scope.energystoragecontainerid, $scope.energystoragecontainerhvac.id, headers, function (response) {
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
        EnergyStorageContainerHVACService.addPair(params.energystoragecontainerid, params.energystoragecontainerhvac.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				EnergyStorageContainerHVACService.getPointsByHVACID(params.energystoragecontainerid, params.energystoragecontainerhvac.id, headers, function (response) {
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
        EnergyStorageContainerHVACService.deletePair(params.energystoragecontainerid, params.energystoragecontainerhvac.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				EnergyStorageContainerHVACService.getPointsByHVACID(params.energystoragecontainerid, params.energystoragecontainerhvac.id, headers, function (response) {
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