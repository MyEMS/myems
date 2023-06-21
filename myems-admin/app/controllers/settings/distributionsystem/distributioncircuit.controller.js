'use strict';

app.controller('DistributionCircuitController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	DistributionSystemService,
	DistributionCircuitService,
	toaster,
	SweetAlert) {
      $scope.distributionsystems = [];
      $scope.distributioncircuits = [];
      $scope.currentDistributionSystem = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      $scope.getAllDistributionSystems = function() {
  		DistributionSystemService.getAllDistributionSystems(function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.distributionsystems = response.data;
  			} else {
  				$scope.distributionsystems = [];
  			}
  		});
  	};

  	$scope.getDistributionCircuitsByDistributionSystemID = function(id) {

  		DistributionCircuitService.getDistributionCircuitsByDistributionSystemID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.distributioncircuits = response.data;
			} else {
          	$scope.distributioncircuits=[];
        }
			});
  	};

  	$scope.changeDistributionSystem=function(item,model){
    		$scope.currentDistributionSystem=item;
    		$scope.currentDistributionSystem.selected=model;
        $scope.is_show_add_distribution_circuit = true;
    		$scope.getDistributionCircuitsByDistributionSystemID($scope.currentDistributionSystem.id);
  	};

  	$scope.addDistributionCircuit = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/distributionsystem/distributioncircuit.model.html',
  			controller: 'ModalAddDistributionCircuitCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(distributioncircuit) {
        distributioncircuit.distribution_system_id = $scope.currentDistributionSystem.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			DistributionCircuitService.addDistributionCircuit(distributioncircuit, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT")}),
  						showCloseButton: true,
  					});
  					$scope.getDistributionCircuitsByDistributionSystemID($scope.currentDistributionSystem.id);
            		$scope.$emit('handleEmitDistributionCircuitChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	$scope.editDistributionCircuit = function(distributioncircuit) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/distributionsystem/distributioncircuit.model.html',
  			controller: 'ModalEditDistributionCircuitCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						distributioncircuit: angular.copy(distributioncircuit),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedDistributionCircuit) {
        modifiedDistributionCircuit.distribution_system_id = $scope.currentDistributionSystem.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			DistributionCircuitService.editDistributionCircuit(modifiedDistributionCircuit, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT")}),
  						showCloseButton: true,
  					});
  					$scope.getDistributionCircuitsByDistributionSystemID($scope.currentDistributionSystem.id);
            		$scope.$emit('handleEmitDistributionCircuitChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT")}),
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

  	$scope.deleteDistributionCircuit = function(distributioncircuit) {
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
  					DistributionCircuitService.deleteDistributionCircuit(distributioncircuit.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT")}),
								showCloseButton: true,
							});
							$scope.getDistributionCircuitsByDistributionSystemID($scope.currentDistributionSystem.id);
							$scope.$emit('handleEmitDistributionCircuitChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
  				   		}
  					});
  				}
  			});
  	};

  	$scope.getAllDistributionSystems();

    $scope.$on('handleBroadcastDistributionSystemChanged', function(event) {
      $scope.getAllDistributionSystems();
  	});

  });


  app.controller('ModalAddDistributionCircuitCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "DISTRIBUTION_SYSTEM.ADD_DISTRIBUTION_CIRCUIT";

  	$scope.ok = function() {
  		$uibModalInstance.close($scope.distributioncircuit);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditDistributionCircuitCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "DISTRIBUTION_SYSTEM.EDIT_DISTRIBUTION_CIRCUIT";
  	$scope.distributioncircuit = params.distributioncircuit;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.distributioncircuit);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
