'use strict';

app.controller('MicrogridPhotovoltaicController', function(
	$scope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridPhotovoltaicService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridphotovoltaics = [];
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

  	$scope.getMicrogridPhotovoltaicsByMicrogridID = function(id) {

  		MicrogridPhotovoltaicService.getMicrogridPhotovoltaicsByMicrogridID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridphotovoltaics = response.data;
			} else {
          	$scope.microgridphotovoltaics=[];
        }
			});
  	};

  	$scope.changeMicrogrid=function(item,model){
    	$scope.currentMicrogrid=item;
    	$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_photovoltaic = true;
    	$scope.getMicrogridPhotovoltaicsByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridPhotovoltaic = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridphotovoltaic.model.html',
  			controller: 'ModalAddMicrogridPhotovoltaicCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridphotovoltaic) {
        microgridphotovoltaic.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridPhotovoltaicService.addMicrogridPhotovoltaic(microgridphotovoltaic, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridPhotovoltaicsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridPhotovoltaicChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
  	};

  	$scope.editMicrogridPhotovoltaic = function(microgridphotovoltaic) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridphotovoltaic.model.html',
  			controller: 'ModalEditMicrogridPhotovoltaicCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridphotovoltaic: angular.copy(microgridphotovoltaic),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridPhotovoltaic) {
        modifiedMicrogridPhotovoltaic.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridPhotovoltaicService.editMicrogridPhotovoltaic(modifiedMicrogridPhotovoltaic, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridPhotovoltaicsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridPhotovoltaicChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {
  			//do nothing;
  		});
  	};

  	$scope.deleteMicrogridPhotovoltaic = function(microgridphotovoltaic) {
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
  					MicrogridPhotovoltaicService.deleteMicrogridPhotovoltaic(microgridphotovoltaic.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
								showCloseButton: true,
							});
							$scope.getMicrogridPhotovoltaicsByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridPhotovoltaicChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_PHOTOVOLTAIC")}),
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


  app.controller('ModalAddMicrogridPhotovoltaicCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_PHOTOVOLTAIC";

  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridphotovoltaic);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridPhotovoltaicCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_PHOTOVOLTAIC";
  	$scope.microgridphotovoltaic = params.microgridphotovoltaic;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridphotovoltaic);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
