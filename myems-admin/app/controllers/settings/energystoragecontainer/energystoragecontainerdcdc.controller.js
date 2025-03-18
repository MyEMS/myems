'use strict';

app.controller('EnergyStorageContainerDCDCController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerDCDCService,
	DataSourceService,
	PointService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerdcdcs = [];
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

  	$scope.getEnergyStorageContainerDCDCsByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerDCDCService.getEnergyStorageContainerDCDCsByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerdcdcs = response.data;
			} else {
          	$scope.energystoragecontainerdcdcs=[];
        }
			});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_dcdc = true;
    	$scope.getEnergyStorageContainerDCDCsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerDCDC = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerdcdc.model.html',
  			controller: 'ModalAddEnergyStorageContainerDCDCCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energystoragecontainerdcdc) {

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerDCDCService.addEnergyStorageContainerDCDC($scope.currentEnergyStorageContainer.id, energystoragecontainerdcdc, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_DCDC")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerDCDCsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerDCDCChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_DCDC")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerDCDC = function(energystoragecontainerdcdc) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerdcdc.model.html',
  			controller: 'ModalEditEnergyStorageContainerDCDCCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerdcdc: angular.copy(energystoragecontainerdcdc),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerDCDC) {

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerDCDCService.editEnergyStorageContainerDCDC($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerDCDC, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_DCDC")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerDCDCsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerDCDCChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_DCDC")}),
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
	$scope.bindEnergyStorageContainerDCDCPoint = function(energystoragecontainerdcdc) {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerdcdcpoint.model.html',
			controller: 'ModalBindEnergyStorageContainerDCDCCtrl',
			windowClass: "animated fadeIn",
				resolve: {
					params: function() {
						return {
							user_uuid: $scope.cur_user.uuid,
							token: $scope.cur_user.token,
							energystoragecontainerid: $scope.currentEnergyStorageContainer.id,
							energystoragecontainerdcdc: angular.copy(energystoragecontainerdcdc),
							meters: angular.copy($scope.meters),
							datasources: angular.copy($scope.datasources),
							points: angular.copy($scope.points),
						};
					}
				}
			});
		$rootScope.modalInstance = modalInstance;
	};

  	$scope.deleteEnergyStorageContainerDCDC = function(energystoragecontainerdcdc) {
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
  					EnergyStorageContainerDCDCService.deleteEnergyStorageContainerDCDC($scope.currentEnergyStorageContainer.id, energystoragecontainerdcdc.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_DCDC")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerDCDCsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerDCDCChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_DCDC")}),
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


  app.controller('ModalAddEnergyStorageContainerDCDCCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_DCDC";
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerdcdc);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerDCDCCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_DCDC";
  	$scope.energystoragecontainerdcdc = params.energystoragecontainerdcdc;
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerdcdc);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalBindEnergyStorageContainerDCDCCtrl', function(
	$scope,
	$uibModalInstance,
	toaster,
	$translate,
	EnergyStorageContainerDCDCService,
	PointService,
	params) {
	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_DCDC";
	$scope.energystoragecontainerid = params.energystoragecontainerid;
	$scope.energystoragecontainerdcdc = params.energystoragecontainerdcdc;
	$scope.datasources=params.datasources;
	$scope.boundpoints=params.boundpoints;

	let headers = { "User-UUID": params.user_uuid, "Token": params.token };
	EnergyStorageContainerDCDCService.getPointsByDCDCID($scope.energystoragecontainerid, $scope.energystoragecontainerdcdc.id, headers, function (response) {
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
        EnergyStorageContainerDCDCService.addPair(params.energystoragecontainerid, params.energystoragecontainerdcdc.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				EnergyStorageContainerDCDCService.getPointsByDCDCID(params.energystoragecontainerid, params.energystoragecontainerdcdc.id, headers, function (response) {
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
        EnergyStorageContainerDCDCService.deletePair(params.energystoragecontainerid, params.energystoragecontainerdcdc.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				EnergyStorageContainerDCDCService.getPointsByDCDCID(params.energystoragecontainerid, params.energystoragecontainerdcdc.id, headers, function (response) {
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
