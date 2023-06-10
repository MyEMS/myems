'use strict';

app.controller('MicrogridBatteryController', function(
	$scope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridBatteryService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridbatteries = [];
      $scope.currentMicrogrid = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.getAllMicrogrids = function() {
  		MicrogridService.getAllMicrogrids(function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.microgrids = response.data;
  			} else {
  				$scope.microgrids = [];
  			}
  		});
  	};

  	$scope.getMicrogridBatteriesByMicrogridID = function(id) {

  		MicrogridBatteryService.getMicrogridBatteriesByMicrogridID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridbatteries = response.data;
			} else {
          	$scope.microgridbatteries=[];
        }
			});
  	};

  	$scope.changeMicrogrid=function(item,model){
    		$scope.currentMicrogrid=item;
    		$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_battery = true;
    		$scope.getMicrogridBatteriesByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridBattery = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridbattery.model.html',
  			controller: 'ModalAddMicrogridBatteryCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridbattery) {
        microgridbattery.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridBatteryService.addMicrogridBattery(microgridbattery, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridBatteriesByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridBatteryChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
  	};

  	$scope.editMicrogridBattery = function(microgridbattery) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridbattery.model.html',
  			controller: 'ModalEditMicrogridBatteryCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridbattery: angular.copy(microgridbattery),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridBattery) {
        modifiedMicrogridBattery.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridBatteryService.editMicrogridBattery(modifiedMicrogridBattery, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridBatteriesByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridBatteryChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {
  			//do nothing;
  		});
  	};

  	$scope.deleteMicrogridBattery = function(microgridbattery) {
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
  					MicrogridBatteryService.deleteMicrogridBattery(microgridbattery.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
								showCloseButton: true,
							});
							$scope.getMicrogridBatteriesByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridBatteryChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_BATTERY")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

  	$scope.getAllMicrogrids();

    $scope.$on('handleBroadcastMicrogridChanged', function(event) {
      $scope.getAllMicrogrids();
  	});

  });


  app.controller('ModalAddMicrogridBatteryCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_BATTERY";

  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridbattery);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridBatteryCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_BATTERY";
  	$scope.microgridbattery = params.microgridbattery;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridbattery);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
