'use strict';

app.controller('MicrogridGeneratorController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	MicrogridService,
	MicrogridGeneratorService,
	toaster,
	SweetAlert) {
      $scope.microgrids = [];
      $scope.microgridgenerators = [];
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

  	$scope.getMicrogridGeneratorsByMicrogridID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		MicrogridGeneratorService.getMicrogridGeneratorsByMicrogridID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.microgridgenerators = response.data;
			} else {
          	$scope.microgridgenerators=[];
        	}
		});
  	};

  	$scope.changeMicrogrid=function(item,model){
    	$scope.currentMicrogrid=item;
    	$scope.currentMicrogrid.selected=model;
        $scope.is_show_add_microgrid_generator = true;
    	$scope.getMicrogridGeneratorsByMicrogridID($scope.currentMicrogrid.id);
  	};

  	$scope.addMicrogridGenerator = function() {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridgenerator.model.html',
  			controller: 'ModalAddMicrogridGeneratorCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(microgridgenerator) {
        microgridgenerator.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridGeneratorService.addMicrogridGenerator(microgridgenerator, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GENERATOR")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridGeneratorsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridGeneratorChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GENERATOR")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editMicrogridGenerator = function(microgridgenerator) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/microgrid/microgridgenerator.model.html',
  			controller: 'ModalEditMicrogridGeneratorCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						microgridgenerator: angular.copy(microgridgenerator),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedMicrogridGenerator) {
        modifiedMicrogridGenerator.microgrid_id = $scope.currentMicrogrid.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			MicrogridGeneratorService.editMicrogridGenerator(modifiedMicrogridGenerator, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GENERATOR")}),
  						showCloseButton: true,
  					});
  					$scope.getMicrogridGeneratorsByMicrogridID($scope.currentMicrogrid.id);
            		$scope.$emit('handleEmitMicrogridGeneratorChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GENERATOR")}),
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

  	$scope.deleteMicrogridGenerator = function(microgridgenerator) {
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
  					MicrogridGeneratorService.deleteMicrogridGenerator(microgridgenerator.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GENERATOR")}),
								showCloseButton: true,
							});
							$scope.getMicrogridGeneratorsByMicrogridID($scope.currentMicrogrid.id);
							$scope.$emit('handleEmitMicrogridGeneratorChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("MICROGRID.MICROGRID_GENERATOR")}),
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


  app.controller('ModalAddMicrogridGeneratorCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "MICROGRID.ADD_MICROGRID_GENERATOR";

  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridgenerator);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditMicrogridGeneratorCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "MICROGRID.EDIT_MICROGRID_GENERATOR";
  	$scope.microgridgenerator = params.microgridgenerator;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.microgridgenerator);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
