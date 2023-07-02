'use strict';

app.controller('MicrogridLoadController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridLoadService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridloads = [];
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
  	};

  	$scope.addMicrogridLoad = function() {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridload.model.html',
  			controller: 'ModalAddMicrogridLoadCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridload) {
        microgridload.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridLoadService.addMicrogridLoad(microgridload, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridLoadsByMicrogridID($scope.currentMicrogrid.id);
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
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridLoad) {
        modifiedMicrogridLoad.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridLoadService.editMicrogridLoad(modifiedMicrogridLoad, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_LOAD")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridLoadsByMicrogridID($scope.currentMicrogrid.id);
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
  					MicrogridLoadService.deleteMicrogridLoad(microgridload.id, headers, function (response) {
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

  	$scope.getAllMicrogrids();

    $scope.$on('handleBroadcastMicrogridChanged', function(event) {
      $scope.getAllMicrogrids();
  	});

  });


  app.controller('ModalAddMicrogridLoadCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_LOAD";

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
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridload);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
