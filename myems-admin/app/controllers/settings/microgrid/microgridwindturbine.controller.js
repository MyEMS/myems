'use strict';

app.controller('MicrogridWindturbineController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridWindturbineService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridwindturbines = [];
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

  	$scope.getMicrogridWindturbinesByMicrogridID = function(id) {

  		MicrogridWindturbineService.getMicrogridWindturbinesByMicrogridID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridwindturbines = response.data;
			} else {
          	$scope.microgridwindturbines=[];
        }
			});
  	};

  	$scope.changeMicrogrid=function(item,model){
    		$scope.currentMicrogrid=item;
    		$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_windturbine = true;
    		$scope.getMicrogridWindturbinesByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridWindturbine = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridwindturbine.model.html',
  			controller: 'ModalAddMicrogridWindturbineCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridwindturbine) {
        microgridwindturbine.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridWindturbineService.addMicrogridWindturbine(microgridwindturbine, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_WINDTURBINE")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridWindturbinesByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridWindturbineChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_WINDTURBINE")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editMicrogridWindturbine = function(microgridwindturbine) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridwindturbine.model.html',
  			controller: 'ModalEditMicrogridWindturbineCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridwindturbine: angular.copy(microgridwindturbine),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridWindturbine) {
        modifiedMicrogridWindturbine.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridWindturbineService.editMicrogridWindturbine(modifiedMicrogridWindturbine, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_WINDTURBINE")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridWindturbinesByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridWindturbineChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_WINDTURBINE")}),
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

  	$scope.deleteMicrogridWindturbine = function(microgridwindturbine) {
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
  					MicrogridWindturbineService.deleteMicrogridWindturbine(microgridwindturbine.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_WINDTURBINE")}),
								showCloseButton: true,
							});
							$scope.getMicrogridWindturbinesByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridWindturbineChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_WINDTURBINE")}),
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


  app.controller('ModalAddMicrogridWindturbineCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_WINDTURBINE";

  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridwindturbine);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridWindturbineCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_WINDTURBINE";
  	$scope.microgridwindturbine = params.microgridwindturbine;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridwindturbine);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
