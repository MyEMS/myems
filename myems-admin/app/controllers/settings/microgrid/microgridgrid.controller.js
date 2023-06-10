'use strict';

app.controller('MicrogridGridController', function(
	$scope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridGridService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridgrids = [];
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

  	$scope.getMicrogridGridsByMicrogridID = function(id) {

  		MicrogridGridService.getMicrogridGridsByMicrogridID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridgrids = response.data;
			} else {
          	$scope.microgridgrids=[];
        }
			});
  	};

  	$scope.changeMicrogrid=function(item,model){
    		$scope.currentMicrogrid=item;
    		$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_grid = true;
    		$scope.getMicrogridGridsByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridGrid = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridgrid.model.html',
  			controller: 'ModalAddMicrogridGridCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridgrid) {
        microgridgrid.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridGridService.addMicrogridGrid(microgridgrid, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridGridsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridGridChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
  	};

  	$scope.editMicrogridGrid = function(microgridgrid) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridgrid.model.html',
  			controller: 'ModalEditMicrogridGridCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridgrid: angular.copy(microgridgrid),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridGrid) {
        modifiedMicrogridGrid.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridGridService.editMicrogridGrid(modifiedMicrogridGrid, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridGridsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridGridChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {
  			//do nothing;
  		});
  	};

  	$scope.deleteMicrogridGrid = function(microgridgrid) {
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
  					MicrogridGridService.deleteMicrogridGrid(microgridgrid.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
								showCloseButton: true,
							});
							$scope.getMicrogridGridsByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridGridChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GRID")}),
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


  app.controller('ModalAddMicrogridGridCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_GRID";

  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridgrid);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridGridCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_GRID";
  	$scope.microgridgrid = params.microgridgrid;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridgrid);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
