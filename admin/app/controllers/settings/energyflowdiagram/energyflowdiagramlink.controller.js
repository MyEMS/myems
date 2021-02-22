'use strict';

app.controller('EnergyFlowDiagramLinkController', function($scope,$common ,$timeout,$uibModal, $translate,	MeterService, VirtualMeterService, OfflineMeterService,	EnergyFlowDiagramLinkService, EnergyFlowDiagramService, EnergyFlowDiagramNodeService, toaster,SweetAlert) {
    $scope.currentEnergyFlowDiagram = {selected:undefined};
    $scope.is_show_add_link = false;
    $scope.energyflowdiagrams = [];
    $scope.energyflowdiagramlinks = [];
    $scope.energyflowdiagramnodes = [];
    $scope.meters = [];
    $scope.offlinemeters = [];
    $scope.virtualmeters = [];
    $scope.mergedMeters = [];

	  $scope.getAllEnergyFlowDiagrams = function() {
		EnergyFlowDiagramService.getAllEnergyFlowDiagrams(function(error, data) {
			if (!error) {
				$scope.energyflowdiagrams = data;
				} else {
				$scope.energyflowdiagrams = [];
			 }
		});
	};

	$scope.changeEnergyFlowDiagram=function(item,model){
		$scope.currentEnergyFlowDiagram=item;
		$scope.currentEnergyFlowDiagram.selected=model;
    $scope.is_show_add_link = true;
		$scope.getLinksByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
    $scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
	};

	$scope.getLinksByEnergyFlowDiagramID = function(id) {

			EnergyFlowDiagramLinkService.getLinksByEnergyFlowDiagramID(id, function(error, data) {
				if (!error) {
					$scope.energyflowdiagramlinks=data;
          $scope.showEnergyFlowDiagramMeter()
				} else {
          	$scope.energyflowdiagramlinks = [];
        }
			});
	};

	$scope.getNodesByEnergyFlowDiagramID = function(id) {

			EnergyFlowDiagramNodeService.getNodesByEnergyFlowDiagramID(id, function(error, data) {
				if (!error) {
					$scope.energyflowdiagramnodes=data;
          console.log($scope.energyflowdiagramnodes);
				} else {
          $scope.energyflowdiagramnodes = [];
        }
			});
	};

	$scope.addEnergyFlowDiagramLink = function() {

		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/energyflowdiagram/energyflowdiagramlink.model.html',
			controller: 'ModalAddEnergyFlowDiagramLinkCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
            energyflowdiagramnodes: angular.copy($scope.energyflowdiagramnodes),
            mergedmeters: angular.copy($scope.mergedmeters),
					};
				}
			}
		});
		modalInstance.result.then(function(energyflowdiagramlink) {
        var energyflowdiagramid = $scope.currentEnergyFlowDiagram.id;
        if (energyflowdiagramlink.source_node != null) {
            energyflowdiagramlink.source_node_id = energyflowdiagramlink.source_node.id;
        }
        if (energyflowdiagramlink.target_node != null) {
            energyflowdiagramlink.target_node_id = energyflowdiagramlink.target_node.id;
        }
        if (energyflowdiagramlink.meter != null) {
            energyflowdiagramlink.meter_uuid = energyflowdiagramlink.meter.uuid;
        }

			EnergyFlowDiagramLinkService.addEnergyFlowDiagramLink(energyflowdiagramid, energyflowdiagramlink, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "ENERGY_FLOW_DIAGRAM.LINK";
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
					$scope.getLinksByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
          $scope.$emit('handleEmitEnergyFlowDiagramLinkChanged');
				} else {
					var templateName = "ENERGY_FLOW_DIAGRAM.LINK";
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

	$scope.editEnergyFlowDiagramLink = function(energyflowdiagramlink) {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/energyflowdiagram/energyflowdiagramlink.model.html',
			controller: 'ModalEditEnergyFlowDiagramLinkCtrl',
  		windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						energyflowdiagramlink: angular.copy(energyflowdiagramlink),
            energyflowdiagramnodes: angular.copy($scope.energyflowdiagramnodes),
            mergedmeters: angular.copy($scope.mergedmeters),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedEnergyFlowDiagramLink) {
      if (modifiedEnergyFlowDiagramLink.source_node != null) {
	        modifiedEnergyFlowDiagramLink.source_node_id = modifiedEnergyFlowDiagramLink.source_node.id;
      }
      if (modifiedEnergyFlowDiagramLink.target_node != null) {
	        modifiedEnergyFlowDiagramLink.target_node_id = modifiedEnergyFlowDiagramLink.target_node.id;
      }
      if (modifiedEnergyFlowDiagramLink.meter != null) {
	        modifiedEnergyFlowDiagramLink.meter_uuid = modifiedEnergyFlowDiagramLink.meter.uuid;
      }
			EnergyFlowDiagramLinkService.editEnergyFlowDiagramLink($scope.currentEnergyFlowDiagram.id, modifiedEnergyFlowDiagramLink, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "ENERGY_FLOW_DIAGRAM.LINK";
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
					$scope.getLinksByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
          $scope.$emit('handleEmitEnergyFlowDiagramLinkChanged');
				} else {
					var templateName = "ENERGY_FLOW_DIAGRAM.LINK";
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

	$scope.deleteEnergyFlowDiagramLink = function(energyflowdiagramlink) {
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
					EnergyFlowDiagramLinkService.deleteEnergyFlowDiagramLink($scope.currentEnergyFlowDiagram.id, energyflowdiagramlink.id, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "ENERGY_FLOW_DIAGRAM.LINK";
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
							$scope.getLinksByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
              $scope.$emit('handleEmitEnergyFlowDiagramLinkChanged');
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
							var templateName = "ENERGY_FLOW_DIAGRAM.LINK";
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

	$scope.colorMeterType=function(type){
		if(type=='meters'){
			return 'btn-primary'
		}else if(type=='virtualmeters'){
			return 'btn-info'
		}else{
			return 'btn-success'
		}
	};

	// $scope.changeMeterType=function(){
	// 	switch($scope.currentMeterType){
	// 		case 'meters':
	// 			$scope.currentmeters=$scope.meters;
	// 			break;
	// 		case 'virtualmeters':
	// 			$scope.currentmeters=$scope.virtualmeters;
	// 			break;
	// 		case  'offlinemeters':
	// 			$scope.currentmeters=$scope.offlinemeters;
	// 			break;
	// 	}
	// };

  $scope.showEnergyFlowDiagramMeter = function(energyflowdiagramlink) {

      if (energyflowdiagramlink == null || energyflowdiagramlink.meter == null) {
        return '-';
      } else {
        return '(' + energyflowdiagramlink.meter.type + ')' + energyflowdiagramlink.meter.name;
      }
  };

  $scope.getMergedMeters = function() {
    $scope.mergedmeters = [];
    $scope.meters = [];
    $scope.offlinemeters = [];
    $scope.virtualmeters = [];
    MeterService.getAllMeters(function(error, data) {
			if (!error) {
				$scope.meters = data;
        for(var i = 0; i < $scope.meters.length; i++) {
            var mergedmeter = {"uuid":  $scope.meters[i].uuid, "name": "meter/"+$scope.meters[i].name};
            $scope.mergedmeters.push(mergedmeter);
       }
				// $scope.currentMeterType="meters";
				// $timeout(function(){
				// 	$scope.changeMeterType();
				// },1000);
			} else {
				$scope.meters = [];
			}
		});

    OfflineMeterService.getAllOfflineMeters(function(error, data) {
			if (!error) {
				$scope.offlinemeters = data;
        for(var i = 0; i < $scope.offlinemeters.length; i++) {
            var mergedmeter = {"uuid":  $scope.offlinemeters[i].uuid, "name": "offlinemeter/"+$scope.offlinemeters[i].name};
            $scope.mergedmeters.push(mergedmeter);
       }
			} else {
				$scope.offlinemeters = [];
			}
		});

    VirtualMeterService.getAllVirtualMeters(function(error, data) {
			if (!error) {
				$scope.virtualmeters = data;
        for(var i = 0; i < $scope.virtualmeters.length; i++) {
            var mergedmeter = {"uuid":  $scope.virtualmeters[i].uuid, "name": "virtualmeter/"+$scope.virtualmeters[i].name};
            $scope.mergedmeters.push(mergedmeter);
       }
			} else {
				$scope.virtualmeters = [];
			}
		});
	};

  $scope.getAllEnergyFlowDiagrams();
  $scope.getMergedMeters();

  $scope.$on('handleBroadcastEnergyFlowDiagramChanged', function(event) {
    $scope.getAllEnergyFlowDiagrams();
  });

  $scope.$on('handleBroadcastEnergyFlowDiagramNodeChanged', function(event) {
    $scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
  });
});

app.controller('ModalAddEnergyFlowDiagramLinkCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "ENERGY_FLOW_DIAGRAM.ADD_LINK";
  $scope.energyflowdiagramlink = {
    source_node: {id: null, name: null},
    target_node: {id: null, name: null},
    meter: {id: null, uuid: null, name: null, type: null},
  };
  $scope.energyflowdiagramnodes = params.energyflowdiagramnodes;
  $scope.mergedmeters = params.mergedmeters;
	$scope.ok = function() {

		$uibModalInstance.close($scope.energyflowdiagramlink);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditEnergyFlowDiagramLinkCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "ENERGY_FLOW_DIAGRAM.EDIT_LINK";
	$scope.energyflowdiagramlink = params.energyflowdiagramlink;
  $scope.energyflowdiagramnodes = params.energyflowdiagramnodes;
  $scope.mergedmeters = params.mergedmeters;
	$scope.ok = function() {
		$uibModalInstance.close($scope.energyflowdiagramlink);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
