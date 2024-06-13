'use strict';

app.controller('EnergyStorageContainerScheduleController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyStorageContainerService,
	EnergyStorageContainerScheduleService,
	toaster,
	SweetAlert) {
      $scope.energystoragecontainers = [];
      $scope.energystoragecontainerschedules = [];
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
	$scope.t={};
	$scope.t.start_hour = '00';
	$scope.t.start_min = '00';
	$scope.t.start_second = '00';
	$scope.t.end_hour = '23';
	$scope.t.end_min = '59';
	$scope.t.end_second = '59';
	$scope.t.peak_type = 'midpeak';
	$scope.t.power = 0.5;

  	$scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyStorageContainerScheduleService.getEnergyStorageContainerSchedulesByEnergyStorageContainerID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragecontainerschedules = response.data;
			} else {
          	$scope.energystoragecontainerschedules=[];
        }
			});
  	};

  	$scope.changeEnergyStorageContainer=function(item,model){
    	$scope.currentEnergyStorageContainer=item;
    	$scope.currentEnergyStorageContainer.selected=model;
        $scope.is_show_add_energystoragecontainer_schedule = true;
    	$scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
  	};

  	$scope.addEnergyStorageContainerSchedule = function() {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerschedule.model.html',
  			controller: 'ModalAddEnergyStorageContainerScheduleCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energystoragecontainerschedule) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerScheduleService.addEnergyStorageContainerSchedule($scope.currentEnergyStorageContainer.id, energystoragecontainerschedule, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_SCHEDULE")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerScheduleChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_SCHEDULE")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editEnergyStorageContainerSchedule = function(energystoragecontainerschedule) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerschedule.model.html',
  			controller: 'ModalEditEnergyStorageContainerScheduleCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energystoragecontainerschedule: angular.copy(energystoragecontainerschedule),
						meters: angular.copy($scope.meters),
						points: angular.copy($scope.points),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyStorageContainerSchedule) {
			modifiedEnergyStorageContainerSchedule.power_point_id = modifiedEnergyStorageContainerSchedule.power_point.id;
			modifiedEnergyStorageContainerSchedule.meter_id = modifiedEnergyStorageContainerSchedule.meter.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyStorageContainerScheduleService.editEnergyStorageContainerSchedule($scope.currentEnergyStorageContainer.id, modifiedEnergyStorageContainerSchedule, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_SCHEDULE")}),
  						showCloseButton: true,
  					});
  					$scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
            		$scope.$emit('handleEmitEnergyStorageContainerScheduleChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_SCHEDULE")}),
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

  	$scope.deleteEnergyStorageContainerSchedule = function(energystoragecontainerschedule) {
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
  					EnergyStorageContainerScheduleService.deleteEnergyStorageContainerSchedule($scope.currentEnergyStorageContainer.id, energystoragecontainerschedule.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_SCHEDULE")}),
								showCloseButton: true,
							});
							$scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
							$scope.$emit('handleEmitEnergyStorageContainerScheduleChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_SCHEDULE")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

  	$scope.getAllEnergyStorageContainers();
    $scope.$on('handleBroadcastEnergyStorageContainerChanged', function(event) {
      $scope.getAllEnergyStorageContainers();
  	});

  });


  app.controller('ModalAddEnergyStorageContainerScheduleCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_SCHEDULE";
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerschedule);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyStorageContainerScheduleCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_SCHEDULE";
  	$scope.energystoragecontainerschedule = params.energystoragecontainerschedule;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energystoragecontainerschedule);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
