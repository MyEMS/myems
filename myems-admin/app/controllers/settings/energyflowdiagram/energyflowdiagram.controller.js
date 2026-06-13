'use strict';

// Energy Flow Diagram controller - CRUD and settings management

app.controller('EnergyFlowDiagramController', function(
    $scope,
    $rootScope,
	$window,
	$translate,
	$uibModal,
	EnergyFlowDiagramService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';
	$scope.searchKeyword = '';
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

	// Open add modal and create energy flow diagram
	$scope.addEnergyFlowDiagram = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/energyflowdiagram/energyflowdiagram.model.html',
			controller: 'ModalAddEnergyFlowDiagramCtrl',
			windowClass: "animated fadeIn",
		});
		modalInstance.result.then(function(energyflowdiagram) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EnergyFlowDiagramService.addEnergyFlowDiagram(energyflowdiagram, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
						showCloseButton: true,
					});
					$scope.getAllEnergyFlowDiagrams();
					$scope.$emit('handleEmitEnergyFlowDiagramChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	// Open edit modal and update energy flow diagram
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EnergyFlowDiagramService.editEnergyFlowDiagram(modifiedEnergyFlowDiagram, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
						showCloseButton: true,
					});
					$scope.getAllEnergyFlowDiagrams();
					$scope.$emit('handleEmitEnergyFlowDiagramChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
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

	// Confirm and delete energy flow diagram
	$scope.deleteEnergyFlowDiagram=function(energyflowdiagram){
		SweetAlert.swal({
		        title: $translate.instant("SWEET.TITLE"),
		        text: $translate.instant("SWEET.TEXT"),
		        type: "warning",
		        showCancelButton: true,
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
		        cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
		        closeOnConfirm: true,
		        closeOnCancel: true },
		    function (isConfirm) {
		        if (isConfirm) {
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		            EnergyFlowDiagramService.deleteEnergyFlowDiagram(energyflowdiagram, headers, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
								showCloseButton: true,
							});
							$scope.getAllEnergyFlowDiagrams();
							$scope.$emit('handleEmitEnergyFlowDiagramChanged');
		            	} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    });
	};

	// Export energy flow diagram as JSON
	$scope.exportEnergyFlowDiagram = function(energyflowdiagram) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyFlowDiagramService.exportEnergyFlowDiagram(energyflowdiagram, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.exportdata = JSON.stringify(response.data);
				var modalInstance = $uibModal.open({
					windowClass: "animated fadeIn",
					templateUrl: 'views/common/export.html',
					controller: 'ModalExportCtrl',
					resolve: {
						params: function() {
							return {
								exportdata: angular.copy($scope.exportdata),
								description: 'SETTING.EXPORT_ENERGY_FLOW_DIAGRAM_DESCRIPTION',
								description_more: 'SETTING.EXPORT_ENERGY_FLOW_DIAGRAM_DESCRIPTION_MORE'
							};
						}
					}
				});
				modalInstance.result.then(function() {
					//do nothing;
				}, function() {
					//do nothing;
				});
				$rootScope.modalInstance = modalInstance;
			} else {
				$scope.exportdata = null;
			}
		});
	};

	// Clone an existing energy flow diagram
	$scope.cloneEnergyFlowDiagram = function(energyflowdiagram){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyFlowDiagramService.cloneEnergyFlowDiagram(energyflowdiagram, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
					showCloseButton: true,
				});
				$scope.getAllEnergyFlowDiagrams();
				$scope.$emit('handleEmitEnergyFlowDiagramChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	// Import energy flow diagram from JSON
	$scope.importEnergyFlowDiagram = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/common/import.html',
			controller: 'ModalImportCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						description: 'SETTING.IMPORT_ENERGY_FLOW_DIAGRAM_DESCRIPTION',
						description_more: 'SETTING.IMPORT_ENERGY_FLOW_DIAGRAM_DESCRIPTION_MORE'
					};
				}
			}
		});
		modalInstance.result.then(function(importdata) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EnergyFlowDiagramService.importEnergyFlowDiagram(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM")}),
						showCloseButton: true,
					});
					$scope.getAllEnergyFlowDiagrams();
					$scope.$emit('handleEmitEnergyFlowDiagramChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.ENERGY_FLOW_DIAGRAM") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	let searchDebounceTimer = null;
	function safeApply(scope) {
		if (!scope.$$phase && !scope.$root.$$phase) {
			scope.$apply();
		}
	}
	// Search energy flow diagrams by keyword
	$scope.searchEnergyFlowDiagrams = function() {
		const headers = {
			"User-UUID": $scope.cur_user?.uuid,
			"Token": $scope.cur_user?.token
		};

		const rawKeyword = $scope.searchKeyword || "";
		const trimmedKeyword = rawKeyword.trim();

		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}

		searchDebounceTimer = setTimeout(() => {
			if (!trimmedKeyword) {
				$scope.getAllEnergyFlowDiagrams();
				safeApply($scope);
				return;
			}

			EnergyFlowDiagramService.searchEnergyFlowDiagrams(trimmedKeyword, headers, (response) => {
				$scope.energyflowdiagrams = (response.status === 200) ? response.data : [];
				$scope.parentmeters = [...$scope.energyflowdiagrams];
			});
		}, 300);
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
