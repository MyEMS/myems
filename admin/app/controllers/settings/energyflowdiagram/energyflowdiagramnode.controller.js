'use strict';

app.controller('EnergyFlowDiagramNodeController', function($scope,$common, $translate, $uibModal, EnergyFlowDiagramService, EnergyFlowDiagramNodeService, toaster,SweetAlert) {
      $scope.energyflowdiagrams = [];
      $scope.energyflowdiagramnodes = [];
      $scope.currentEnergyFlowDiagram = null;

      $scope.getAllEnergyFlowDiagrams = function() {
  		EnergyFlowDiagramService.getAllEnergyFlowDiagrams(function(error, data) {
  			if (!error) {
  				$scope.energyflowdiagrams = data;
  				} else {
  				$scope.energyflowdiagrams = [];
  			 }
  		});
  	};

  	$scope.getNodesByEnergyFlowDiagramID = function(id) {

  		EnergyFlowDiagramNodeService.getNodesByEnergyFlowDiagramID(id, function(error, data) {
				if (!error) {
					$scope.energyflowdiagramnodes=data;
				} else {
          $scope.energyflowdiagramnodes=[];
        }
			});
  	};

  	$scope.changeEnergyFlowDiagram=function(item,model){
    		$scope.currentEnergyFlowDiagram=item;
    		$scope.currentEnergyFlowDiagram.selected=model;
        $scope.is_show_add_node = true;
    		$scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
  	};

  	$scope.addEnergyFlowDiagramNode = function() {

  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energyflowdiagram/energyflowdiagramnode.model.html',
  			controller: 'ModalAddEnergyFlowDiagramNodeCtrl',
  			windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  					};
  				}
  			}
  		});
  		modalInstance.result.then(function(energyflowdiagramnode) {
          var energyflowdiagramid = $scope.currentEnergyFlowDiagram.id;

  			EnergyFlowDiagramNodeService.addEnergyFlowDiagramNode(energyflowdiagramid, energyflowdiagramnode, function(error, status) {
  				if (angular.isDefined(status) && status == 201) {
  					var templateName = "ENERGY_FLOW_DIAGRAM.NODE";
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
  					$scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
  					$scope.$emit('handleEmitEnergyFlowDiagramNodeChanged');
  				} else {
  					var templateName = "ENERGY_FLOW_DIAGRAM.NODE";
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

  	$scope.editEnergyFlowDiagramNode = function(energyflowdiagramnode) {
  		var modalInstance = $uibModal.open({
  			templateUrl: 'views/settings/energyflowdiagram/energyflowdiagramnode.model.html',
  			controller: 'ModalEditEnergyFlowDiagramNodeCtrl',
    		windowClass: "animated fadeIn",
  			resolve: {
  				params: function() {
  					return {
  						energyflowdiagramnode: angular.copy(energyflowdiagramnode),
  					};
  				}
  			}
  		});

  		modalInstance.result.then(function(modifiedEnergyFlowDiagramNode) {
  			EnergyFlowDiagramNodeService.editEnergyFlowDiagramNode($scope.currentEnergyFlowDiagram.id, modifiedEnergyFlowDiagramNode, function(error, status) {
  				if (angular.isDefined(status) && status == 200) {
  					var templateName = "ENERGY_FLOW_DIAGRAM.NODE";
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
  					$scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
  					$scope.$emit('handleEmitEnergyFlowDiagramNodeChanged');
  				} else {
  					var templateName = "ENERGY_FLOW_DIAGRAM.NODE";
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

  	$scope.deleteEnergyFlowDiagramNode = function(energyflowdiagramnode) {
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
  					EnergyFlowDiagramNodeService.deleteEnergyFlowDiagramNode($scope.currentEnergyFlowDiagram.id, energyflowdiagramnode.id, function(error, status) {
  						if (angular.isDefined(status) && status == 204) {
  							var templateName = "ENERGY_FLOW_DIAGRAM.NODE";
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
  							$scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
      					$scope.$emit('handleEmitEnergyFlowDiagramNodeChanged');
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
  							var templateName = "ENERGY_FLOW_DIAGRAM.NODE";
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

  	$scope.getAllEnergyFlowDiagrams();

    $scope.$on('handleBroadcastEnergyFlowDiagramChanged', function(event) {
      $scope.getAllEnergyFlowDiagrams();
    });
  });


  app.controller('ModalAddEnergyFlowDiagramNodeCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_FLOW_DIAGRAM.ADD_NODE";

  	$scope.ok = function() {

  		$uibModalInstance.close($scope.energyflowdiagramnode);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

  app.controller('ModalEditEnergyFlowDiagramNodeCtrl', function($scope, $uibModalInstance, params) {
  	$scope.operation = "ENERGY_FLOW_DIAGRAM.EDIT_NODE";
  	$scope.energyflowdiagramnode = params.energyflowdiagramnode;
  	$scope.ok = function() {
  		$uibModalInstance.close($scope.energyflowdiagramnode);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });
