'use strict';

app.controller('EnergyStorageContainerFirecontrolController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerFirecontrolService,
	DataSourceService,
	PointService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerfirecontrols = [];
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

  	$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerFirecontrolService.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerfirecontrols = response.data;
			} else {
          	$scope.energystoragecontainerfirecontrols=[];
        }
			});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_firecontrol = true;
    	$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerFirecontrol = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerfirecontrol.model.html',
  			controller: 'ModalAddEnergyStorageContainerFirecontrolCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energystoragecontainerfirecontrol) {

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerFirecontrolService.addEnergyStorageContainerFirecontrol($scope.currentEnergyStorageContainer.id, energystoragecontainerfirecontrol, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerFirecontrolChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerFirecontrol = function(energystoragecontainerfirecontrol) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerfirecontrol.model.html',
  			controller: 'ModalEditEnergyStorageContainerFirecontrolCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerfirecontrol: angular.copy(energystoragecontainerfirecontrol),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerFirecontrol) {

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerFirecontrolService.editEnergyStorageContainerFirecontrol($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerFirecontrol, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerFirecontrolChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
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
	$scope.bindEnergyStorageContainerFirecontrolPoint = function(energystoragecontainerfirecontrol) {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerfirecontrolpoint.model.html',
			controller: 'ModalBindEnergyStorageContainerFirecontrolCtrl',
			windowClass: "animated fadeIn",
				resolve: {
					params: function() {
						return {
							user_uuid: $scope.cur_user.uuid,
							token: $scope.cur_user.token,
							energystoragecontainerid: $scope.currentEnergyStorageContainer.id,
							energystoragecontainerfirecontrol: angular.copy(energystoragecontainerfirecontrol),
							meters: angular.copy($scope.meters),
							datasources: angular.copy($scope.datasources),
							points: angular.copy($scope.points),
						};
					}
				}
			});
		$rootScope.modalInstance = modalInstance;
	};

  	$scope.deleteEnergyStorageContainerFirecontrol = function(energystoragecontainerfirecontrol) {
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
  					EnergyStorageContainerFirecontrolService.deleteEnergyStorageContainerFirecontrol($scope.currentEnergyStorageContainer.id, energystoragecontainerfirecontrol.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerFirecontrolsByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerFirecontrolChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_FIRECONTROL")}),
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


  app.controller('ModalAddEnergyStorageContainerFirecontrolCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_FIRECONTROL";
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerfirecontrol);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerFirecontrolCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_FIRECONTROL";
  	$scope.energystoragecontainerfirecontrol = params.energystoragecontainerfirecontrol;
	$scope.points=params.points;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerfirecontrol);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalBindEnergyStorageContainerFirecontrolCtrl', function(
	$scope,
	$uibModalInstance,
	toaster,
	$translate,
	EnergyStorageContainerFirecontrolService,
	PointService,
	params) {
	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_FIRECONTROL";
	$scope.energystoragecontainerid = params.energystoragecontainerid;
	$scope.energystoragecontainerfirecontrol = params.energystoragecontainerfirecontrol;
	$scope.datasources=params.datasources;
	$scope.boundpoints=params.boundpoints;

	let headers = { "User-UUID": params.user_uuid, "Token": params.token };
	EnergyStorageContainerFirecontrolService.getPointsByFirecontrolID($scope.energystoragecontainerid, $scope.energystoragecontainerfirecontrol.id, headers, function (response) {
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
        EnergyStorageContainerFirecontrolService.addPair(params.energystoragecontainerid, params.energystoragecontainerfirecontrol.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				EnergyStorageContainerFirecontrolService.getPointsByFirecontrolID(params.energystoragecontainerid, params.energystoragecontainerfirecontrol.id, headers, function (response) {
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
        EnergyStorageContainerFirecontrolService.deletePair(params.energystoragecontainerid, params.energystoragecontainerfirecontrol.id, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                let headers = { "User-UUID": params.user_uuid, "Token": params.token };
				EnergyStorageContainerFirecontrolService.getPointsByFirecontrolID(params.energystoragecontainerid, params.energystoragecontainerfirecontrol.id, headers, function (response) {
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
