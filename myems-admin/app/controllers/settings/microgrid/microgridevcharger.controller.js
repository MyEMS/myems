'use strict';

app.controller('MicrogridEVChargerController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridEVChargerService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridevchargers = [];
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

  	$scope.getMicrogridEVChargersByMicrogridID = function(id) {

  		MicrogridEVChargerService.getMicrogridEVChargersByMicrogridID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridevchargers = response.data;
			} else {
          	$scope.microgridevchargers=[];
        }
			});
  	};

  	$scope.changeMicrogrid=function(item,model){
    		$scope.currentMicrogrid=item;
    		$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_evcharger = true;
    		$scope.getMicrogridEVChargersByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridEVCharger = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridevcharger.model.html',
  			controller: 'ModalAddMicrogridEVChargerCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridevcharger) {
        microgridevcharger.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridEVChargerService.addMicrogridEVCharger(microgridevcharger, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_EVCHARGER")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridEVChargersByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridEVChargerChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_EVCHARGER")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editMicrogridEVCharger = function(microgridevcharger) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridevcharger.model.html',
  			controller: 'ModalEditMicrogridEVChargerCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridevcharger: angular.copy(microgridevcharger),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridEVCharger) {
        modifiedMicrogridEVCharger.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridEVChargerService.editMicrogridEVCharger(modifiedMicrogridEVCharger, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_EVCHARGER")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridEVChargersByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridEVChargerChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_EVCHARGER")}),
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

  	$scope.deleteMicrogridEVCharger = function(microgridevcharger) {
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
  					MicrogridEVChargerService.deleteMicrogridEVCharger(microgridevcharger.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_EVCHARGER")}),
								showCloseButton: true,
							});
							$scope.getMicrogridEVChargersByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridEVChargerChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_EVCHARGER")}),
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


  app.controller('ModalAddMicrogridEVChargerCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_EVCHARGER";

  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridevcharger);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridEVChargerCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_EVCHARGER";
  	$scope.microgridevcharger = params.microgridevcharger;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridevcharger);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
