'use strict';

app.controller('DistributionCircuitController', function($scope,$common, $translate, $uibModal, DistributionSystemService, DistributionCircuitService, toaster,SweetAlert) {
      $scope.distributionsystems = [];
      $scope.distributioncircuits = [];
      $scope.currentDistributionSystem = null;

      $scope.getAllDistributionSystems = function() {
  		DistributionSystemService.getAllDistributionSystems(function(error, data) {
  			if (!error) {
  				$scope.distributionsystems = data;
  				} else {
  				$scope.distributionsystems = [];
  			 }
  		});
  	};

  	$scope.getDistributionCircuitsByDistributionSystemID = function(id) {

  		DistributionCircuitService.getDistributionCircuitsByDistributionSystemID(id, function(error, data) {
				if (!error) {
					$scope.distributioncircuits=data;
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
  			DistributionCircuitService.addDistributionCircuit(distributioncircuit, function(error, status) {
  				if (angular.isDefined(status) && status == 201) {
  					var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT";
  					templateName = $translate.instant(templateName);

  					var popType = 'TOASTER.SUCCESS';
  					var popTitle = $common.toaster.success_title;
  					var popBody = $common.toaster.success_add_body;

  					popType = $translate.instant(popType);
  					popTitle = $translate.instant(popTitle);
  					popBody = $translate.instant(popBody,{template: templateName});

  					toaster.pop({
  						type: popType,
  						title: popTitle,
  						body: popBody,
  						showCloseButton: true,
  					});
  					$scope.getDistributionCircuitsByDistributionSystemID($scope.currentDistributionSystem.id);
            $scope.$emit('handleEmitDistributionCircuitChanged');
  				} else {
  					var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT";
  					templateName = $translate.instant(templateName);

  					var popType = 'TOASTER.ERROR';
  					var popTitle = $common.toaster.error_title;
  					var popBody = $common.toaster.error_add_body;

  					popType = $translate.instant(popType);
  					popTitle = $translate.instant(popTitle);
  					popBody = $translate.instant(popBody,{template: templateName});

  					toaster.pop({
  						type: popType,
  						title: popTitle,
  						body: popBody,
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
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
  			DistributionCircuitService.editDistributionCircuit(modifiedDistributionCircuit, function(error, status) {
  				if (angular.isDefined(status) && status == 200) {
  					var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT";
  					templateName = $translate.instant(templateName);

  					var popType = 'TOASTER.SUCCESS';
  					var popTitle = $common.toaster.success_title;
  					var popBody = $common.toaster.success_update_body;

  					popType = $translate.instant(popType);
  					popTitle = $translate.instant(popTitle);
  					popBody = $translate.instant(popBody,{template: templateName});

  					toaster.pop({
  						type: popType,
  						title: popTitle,
  						body: popBody,
  						showCloseButton: true,
  					});
  					$scope.getDistributionCircuitsByDistributionSystemID($scope.currentDistributionSystem.id);
            $scope.$emit('handleEmitDistributionCircuitChanged');
  				} else {
  					var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT";
  					templateName = $translate.instant(templateName);

  					var popType = 'TOASTER.ERROR';
  					var popTitle = $common.toaster.error_title;
  					var popBody = $common.toaster.error_update_body;

  					popType = $translate.instant(popType);
  					popTitle = $translate.instant(popTitle);
  					popBody = $translate.instant(popBody,{template: templateName});

  					toaster.pop({
  						type: popType,
  						title: popTitle,
  						body: popBody,
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {
  			//do nothing;
  		});
  	};

  	$scope.deleteDistributionCircuit = function(distributioncircuit) {
  		SweetAlert.swal({
  				title: $translate.instant($common.sweet.title),
  				text: $translate.instant($common.sweet.text),
  				type: "warning",
  				showCancelButton: true,
  				confirmButtonColor: "#DD6B55",
  				confirmButtonText: $translate.instant($common.sweet.confirmButtonText),
  				cancelButtonText: $translate.instant($common.sweet.cancelButtonText),
  				closeOnConfirm: true,
  				closeOnCancel: true
  			},
  			function(isConfirm) {
  				if (isConfirm) {
  					DistributionCircuitService.deleteDistributionCircuit(distributioncircuit.id, function(error, status) {
  						if (angular.isDefined(status) && status == 204) {
  							var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT";
                templateName = $translate.instant(templateName);

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = $common.toaster.success_delete_body;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody, {template: templateName});

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
  							$scope.getDistributionCircuitsByDistributionSystemID($scope.currentDistributionSystem.id);
                $scope.$emit('handleEmitDistributionCircuitChanged');
  						} else if (angular.isDefined(status) && status == 400) {
  							var popType = 'TOASTER.ERROR';
                var popTitle = error.title;
                var popBody = error.description;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
  						} else {
  							var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_CIRCUIT";
                templateName = $translate.instant(templateName);

                var popType = 'TOASTER.ERROR';
                var popTitle = $common.toaster.error_title;
                var popBody = $common.toaster.error_delete_body;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody, {template: templateName});

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
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
