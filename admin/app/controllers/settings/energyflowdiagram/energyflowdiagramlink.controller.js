'use strict';

app.controller('EnergyFlowDiagramLinkController', function($scope,$uibModal, $translate, MeterService, VirtualMeterService, OfflineMeterService,	EnergyFlowDiagramLinkService, EnergyFlowDiagramService, EnergyFlowDiagramNodeService, toaster,SweetAlert) {
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
		EnergyFlowDiagramService.getAllEnergyFlowDiagrams(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energyflowdiagrams = response.data;
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
		EnergyFlowDiagramLinkService.getLinksByEnergyFlowDiagramID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energyflowdiagramlinks = response.data;
				$scope.showEnergyFlowDiagramMeter()
			} else {
				$scope.energyflowdiagramlinks = [];
			}
		});
	};

	$scope.getNodesByEnergyFlowDiagramID = function(id) {

		EnergyFlowDiagramNodeService.getNodesByEnergyFlowDiagramID(id, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energyflowdiagramnodes = response.data;
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

			EnergyFlowDiagramLinkService.addEnergyFlowDiagramLink(energyflowdiagramid, energyflowdiagramlink, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.LINK")}),
						showCloseButton: true,
					});
					$scope.getLinksByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
          			$scope.$emit('handleEmitEnergyFlowDiagramLinkChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.LINK")}),
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
			EnergyFlowDiagramLinkService.editEnergyFlowDiagramLink($scope.currentEnergyFlowDiagram.id, modifiedEnergyFlowDiagramLink, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.LINK")}),
						showCloseButton: true,
					});
					$scope.getLinksByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
          			$scope.$emit('handleEmitEnergyFlowDiagramLinkChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.LINK")}),
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
					EnergyFlowDiagramLinkService.deleteEnergyFlowDiagramLink($scope.currentEnergyFlowDiagram.id, energyflowdiagramlink.id, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.LINK")}),
								showCloseButton: true,
							});
							$scope.getLinksByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
              				$scope.$emit('handleEmitEnergyFlowDiagramLinkChanged');
						} else if (angular.isDefined(response.status) && response.status === 400) {
							toaster.pop({
								type: "error",
								title: $translate.instant(response.data.title),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.FAILURE_TITLE"),
								body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.LINK")}),
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
		MeterService.getAllMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				for(var i = 0; i < $scope.meters.length; i++) {
					var mergedmeter = {"uuid":  $scope.meters[i].uuid, "name": "meter/"+$scope.meters[i].name};
					$scope.mergedmeters.push(mergedmeter);
				}
			} else {
				$scope.meters = [];
				}
			});

		OfflineMeterService.getAllOfflineMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeters = response.data;
				for(var i = 0; i < $scope.offlinemeters.length; i++) {
					var mergedmeter = {"uuid":  $scope.offlinemeters[i].uuid, "name": "offlinemeter/"+$scope.offlinemeters[i].name};
					$scope.mergedmeters.push(mergedmeter);
				}
			} else {
				$scope.offlinemeters = [];
			}
		});

		VirtualMeterService.getAllVirtualMeters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.virtualmeters = response.data;
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
