'use strict';

app.controller('WindFarmController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
    ContactService,
    SVGService,
    WindFarmService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.getAllCostCenters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CostCenterService.getAllCostCenters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ContactService.getAllContacts(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
			} else {
				$scope.contacts = [];
			}
		});
	};

	$scope.getAllSVGs = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token, "Quickmode": 'true'  };
		SVGService.getAllSVGs(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.svgs = response.data;
			} else {
				$scope.svgs = [];
			}
		});
	};

	$scope.getAllWindFarms = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WindFarmService.getAllWindFarms(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.windfarms = response.data;
			} else {
				$scope.windfarms = [];
			}
		});
	};

        let searchDebounceTimer = null;
        $scope.searchWindFarms = function() {
                let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
                const rawKeyword = $scope.searchKeyword || "";
                const trimmedKeyword = rawKeyword.trim();
                if (searchDebounceTimer) {
                    clearTimeout(searchDebounceTimer);
                }               
                searchDebounceTimer = setTimeout(() => {
                    if (!trimmedKeyword) {
                        $scope.getAllWindFarms();
                        return;
                    }
                WindFarmService.searchWindFarms(trimmedKeyword, headers, function (response) {
                        if (angular.isDefined(response.status) && response.status === 200) {
                                $scope.windfarms = response.data;
                        } else {
                                $scope.windfarms = [];
                        }       
                });
                }, 300);
        };

	$scope.addWindFarm = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/windfarm/windfarm.model.html',
			controller: 'ModalAddWindFarmCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
						svgs: angular.copy($scope.svgs),
					};
				}
			}
		});
		modalInstance.result.then(function(windfarm) {
			windfarm.cost_center_id = windfarm.cost_center.id;
			windfarm.contact_id = windfarm.contact.id;
			windfarm.svg_id = windfarm.svg.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WindFarmService.addWindFarm(windfarm, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.WIND_FARM")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitWindFarmChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.WIND_FARM") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editWindFarm = function(windfarm) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/windfarm/windfarm.model.html',
			controller: 'ModalEditWindFarmCtrl',
			resolve: {
				params: function() {
					return {
						windfarm: angular.copy(windfarm),
						costcenters:angular.copy($scope.costcenters),
						contacts:angular.copy($scope.contacts),
						svgs: angular.copy($scope.svgs),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedWindFarm) {
			modifiedWindFarm.cost_center_id=modifiedWindFarm.cost_center.id;
			modifiedWindFarm.contact_id=modifiedWindFarm.contact.id;
			modifiedWindFarm.svg_id=modifiedWindFarm.svg.id;

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WindFarmService.editWindFarm(modifiedWindFarm, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.WIND_FARM")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitWindFarmChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.WIND_FARM")}),
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

	$scope.deleteWindFarm=function(windfarm){
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
		            WindFarmService.deleteWindFarm(windfarm, headers, function(response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.WIND_FARM")}),
								showCloseButton: true,
							});
							$scope.$emit('handleEmitWindFarmChanged');
						}else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.WIND_FARM")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    });
	};

	$scope.exportWindFarm = function(modifiedWindFarm) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WindFarmService.exportWindFarm(modifiedWindFarm, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.exportdata = JSON.stringify(response.data);
				var modalInstance = $uibModal.open({
					windowClass: "animated fadeIn",
					templateUrl: 'views/common/export.html',
					controller: 'ModalExportCtrl',
					resolve: {
						params: function() {
							return {
								exportdata: angular.copy($scope.exportdata)
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

	$scope.cloneWindFarm = function(modifiedWindFarm){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WindFarmService.cloneWindFarm(modifiedWindFarm, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.WIND_FARM")}),
					showCloseButton: true,
				});
				$scope.getAllWindFarms();
				$scope.$emit('handleEmitWindFarmChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.WIND_FARM")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importWindFarm = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/common/import.html',
			controller: 'ModalImportCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
					};
				}
			}
		});
		modalInstance.result.then(function(importdata) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WindFarmService.importWindFarm(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.WIND_FARM")}),
						showCloseButton: true,
					});
					$scope.getAllWindFarms();
					$scope.$emit('handleEmitWindFarmChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.WIND_FARM") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllWindFarms();
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	$scope.getAllSVGs();
	$scope.$on('handleBroadcastWindFarmChanged', function(event) {
  		$scope.getAllWindFarms();
	});
});

app.controller('ModalAddWindFarmCtrl', function($scope, $uibModalInstance,params) {

	$scope.operation = "SETTING.ADD_WIND_FARM";
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.svgs=params.svgs;
	$scope.ok = function() {
		$uibModalInstance.close($scope.windfarm);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditWindFarmCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_WIND_FARM";
	$scope.windfarm = params.windfarm;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.svgs=params.svgs;
	$scope.ok = function() {
		$uibModalInstance.close($scope.windfarm);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
