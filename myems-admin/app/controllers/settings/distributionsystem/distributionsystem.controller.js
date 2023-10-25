'use strict';

app.controller('DistributionSystemController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	DistributionSystemService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllDistributionSystems = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		DistributionSystemService.getAllDistributionSystems(headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.distributionsystems = response.data;
			} else {
				$scope.distributionsystems = [];
			}
		});
	};

	$scope.addDistributionSystem = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/distributionsystem/distributionsystem.model.html',
			controller: 'ModalAddDistributionSystemCtrl',
			windowClass: "animated fadeIn",
		});
		modalInstance.result.then(function(distributionsystem) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			DistributionSystemService.addDistributionSystem(distributionsystem, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM")}),
						showCloseButton: true,
					});
					$scope.getAllDistributionSystems();
					$scope.$emit('handleEmitDistributionSystemChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editDistributionSystem = function(distributionsystem) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/distributionsystem/distributionsystem.model.html',
			controller: 'ModalEditDistributionSystemCtrl',
			resolve: {
				params: function() {
					return {
						distributionsystem: angular.copy(distributionsystem)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedDistributionSystem) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			DistributionSystemService.editDistributionSystem(modifiedDistributionSystem, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM")}),
						showCloseButton: true,
					});
					$scope.getAllDistributionSystems();
					$scope.$emit('handleEmitDistributionSystemChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM")}),
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

	$scope.deleteDistributionSystem=function(distributionsystem){
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
		            DistributionSystemService.deleteDistributionSystem(distributionsystem, headers, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM")}),
								showCloseButton: true,
							});
							$scope.getAllDistributionSystems();
          					$scope.$emit('handleEmitDistributionSystemChanged');
							$window.location.reload();
		            	} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    });
	};
	$scope.getAllDistributionSystems();
});

app.controller("ModalAddDistributionSystemCtrl", function(  $scope,  $uibModalInstance) {
  $scope.operation = "DISTRIBUTION_SYSTEM.ADD_DISTRIBUTION_SYSTEM";
  $scope.ok = function() {
    $uibModalInstance.close($scope.distributionsystem);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
});

app.controller("ModalEditDistributionSystemCtrl", function($scope, $uibModalInstance,  params) {
  $scope.operation = "DISTRIBUTION_SYSTEM.EDIT_DISTRIBUTION_SYSTEM";
  $scope.distributionsystem = params.distributionsystem;

  $scope.ok = function() {
    $uibModalInstance.close($scope.distributionsystem);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
});
