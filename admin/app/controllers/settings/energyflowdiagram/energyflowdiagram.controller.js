'use strict';

app.controller('EnergyFlowDiagramController', function($scope,$common, $translate, $uibModal, EnergyFlowDiagramService, toaster,SweetAlert) {

	$scope.getAllEnergyFlowDiagrams = function() {
		EnergyFlowDiagramService.getAllEnergyFlowDiagrams(function(error, data) {
			if (!error) {
				$scope.energyflowdiagrams = data;
			} else {
				$scope.energyflowdiagrams = [];
			}
		});
	};

	$scope.addEnergyFlowDiagram = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/energyflowdiagram/energyflowdiagram.model.html',
			controller: 'ModalAddEnergyFlowDiagramCtrl',
			windowClass: "animated fadeIn",
		});
		modalInstance.result.then(function(energyflowdiagram) {
			EnergyFlowDiagramService.addEnergyFlowDiagram(energyflowdiagram, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "COMMON.ENERGY_FLOW_DIAGRAM";
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
					$scope.getAllEnergyFlowDiagrams();
					$scope.$emit('handleEmitEnergyFlowDiagramChanged');
				} else {
					var templateName = "COMMON.ENERGY_FLOW_DIAGRAM";
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

	$scope.editEnergyFlowDiagram = function(energyflowdiagram) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/energyflowdiagram/energyflowdiagram.model.html',
			controller: 'ModalEditEnergyFlowDiagramCtrl',
			resolve: {
				params: function() {
					return {
						energyflowdiagram: angular.copy(energyflowdiagram)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedEnergyFlowDiagram) {
			EnergyFlowDiagramService.editEnergyFlowDiagram(modifiedEnergyFlowDiagram, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMMON.ENERGY_FLOW_DIAGRAM";
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
					$scope.getAllEnergyFlowDiagrams();
					$scope.$emit('handleEmitEnergyFlowDiagramChanged');
				} else {
					var templateName = "COMMON.ENERGY_FLOW_DIAGRAM";
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

	$scope.deleteEnergyFlowDiagram=function(energyflowdiagram){
		SweetAlert.swal({
		        title: $translate.instant($common.sweet.title),
		        text: $translate.instant($common.sweet.text),
		        type: "warning",
		        showCancelButton: true,
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: $translate.instant($common.sweet.confirmButtonText),
		        cancelButtonText: $translate.instant($common.sweet.cancelButtonText),
		        closeOnConfirm: true,
		        closeOnCancel: true },
		    function (isConfirm) {
		        if (isConfirm) {
		            EnergyFlowDiagramService.deleteEnergyFlowDiagram(energyflowdiagram, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "COMMON.ENERGY_FLOW_DIAGRAM";
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
							      $scope.getAllEnergyFlowDiagrams();
										$scope.$emit('handleEmitEnergyFlowDiagramChanged');
		            	} else {
		            		var templateName = "COMMON.ENERGY_FLOW_DIAGRAM";
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
});

app.controller("ModalAddEnergyFlowDiagramCtrl", function(  $scope,  $uibModalInstance) {
  $scope.operation = "ENERGY_FLOW_DIAGRAM.ADD_ENERGY_FLOW_DIAGRAM";
  $scope.ok = function() {
    $uibModalInstance.close($scope.energyflowdiagram);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
});

app.controller("ModalEditEnergyFlowDiagramCtrl", function($scope, $uibModalInstance,  params) {
  $scope.operation = "ENERGY_FLOW_DIAGRAM.EDIT_ENERGY_FLOW_DIAGRAM";
  $scope.energyflowdiagram = params.energyflowdiagram;

  $scope.ok = function() {
    $uibModalInstance.close($scope.energyflowdiagram);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
});
