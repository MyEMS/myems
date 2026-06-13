'use strict';

// Energy Flow Diagram Node controller - CRUD and settings management

app.controller('EnergyFlowDiagramNodeController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyFlowDiagramService,
	EnergyFlowDiagramNodeService,
	toaster,
	SweetAlert) {
      $scope.energyflowdiagrams = [];
      $scope.energyflowdiagramnodes = [];
      $scope.currentEnergyFlowDiagram = null;
	  $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
      // Load all energy flow diagrams from API
      $scope.getAllEnergyFlowDiagrams = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyFlowDiagramService.getAllEnergyFlowDiagrams(headers, function (response) {
  			if (angular.isDefined(response.status) && response.status === 200) {
  				$scope.energyflowdiagrams = response.data;
  				} else {
  				$scope.energyflowdiagrams = [];
  			 }
  		});
  	};

  	// Load nodes by energy flow diagram id
  	$scope.getNodesByEnergyFlowDiagramID = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  		EnergyFlowDiagramNodeService.getNodesByEnergyFlowDiagramID(id, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.energyflowdiagramnodes = response.data;
				} else {
          $scope.energyflowdiagramnodes=[];
        }
			});
  	};

  	// Handle energy flow diagram change
  	$scope.changeEnergyFlowDiagram=function(item,model){
    		$scope.currentEnergyFlowDiagram=item;
    		$scope.currentEnergyFlowDiagram.selected=model;
        $scope.is_show_add_node = true;
    		$scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
  	};

  	// Open add modal and create energy flow diagram node
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyFlowDiagramNodeService.addEnergyFlowDiagramNode(energyflowdiagramid, energyflowdiagramnode, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 201) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.NODE")}),
  						showCloseButton: true,
  					});
  					$scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
  					$scope.$emit('handleEmitEnergyFlowDiagramNodeChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.NODE")}),
  						body: $translate.instant(response.data.description),
  						showCloseButton: true,
  					});
  				}
  			});
  		}, function() {

  		});
		$rootScope.modalInstance = modalInstance;
  	};

  	// Open edit modal and update energy flow diagram node
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
  			EnergyFlowDiagramNodeService.editEnergyFlowDiagramNode($scope.currentEnergyFlowDiagram.id, modifiedEnergyFlowDiagramNode, headers, function (response) {
  				if (angular.isDefined(response.status) && response.status === 200) {
  					toaster.pop({
  						type: "success",
  						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
  						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.NODE")}),
  						showCloseButton: true,
  					});
  					$scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
  					$scope.$emit('handleEmitEnergyFlowDiagramNodeChanged');
  				} else {
  					toaster.pop({
  						type: "error",
  						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.NODE")}),
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

  	// Confirm and delete energy flow diagram node
  	$scope.deleteEnergyFlowDiagramNode = function(energyflowdiagramnode) {
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
  					EnergyFlowDiagramNodeService.deleteEnergyFlowDiagramNode($scope.currentEnergyFlowDiagram.id, energyflowdiagramnode.id, headers, function (response) {
  						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.NODE")}),
								showCloseButton: true,
							});
  							$scope.getNodesByEnergyFlowDiagramID($scope.currentEnergyFlowDiagram.id);
      						$scope.$emit('handleEmitEnergyFlowDiagramNodeChanged');
  						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("ENERGY_FLOW_DIAGRAM.NODE")}),
								body: $translate.instant(response.data.description),
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


// Modal controller for add dialog
  app.controller('ModalAddEnergyFlowDiagramNodeCtrl', function($scope, $uibModalInstance, params) {

  	$scope.operation = "ENERGY_FLOW_DIAGRAM.ADD_NODE";

  	$scope.ok = function() {

  		$uibModalInstance.close($scope.energyflowdiagramnode);
  	};

  	$scope.cancel = function() {
  		$uibModalInstance.dismiss('cancel');
  	};
  });

// Modal controller for edit dialog
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
