'use strict';

app.controller('DistributionSystemController', function($scope,$common, $translate, $uibModal, DistributionSystemService, toaster,SweetAlert) {

	$scope.getAllDistributionSystems = function() {
		DistributionSystemService.getAllDistributionSystems(function(error, data) {
			if (!error) {
				$scope.distributionsystems = data;
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
			DistributionSystemService.addDistributionSystem(distributionsystem, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM";
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
					$scope.getAllDistributionSystems();
					$scope.$emit('handleEmitDistributionSystemChanged');
				} else {
					var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM";
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
			DistributionSystemService.editDistributionSystem(modifiedDistributionSystem, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM";
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
					$scope.getAllDistributionSystems();
					$scope.$emit('handleEmitDistributionSystemChanged');
				} else {
					var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM";
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

	$scope.deleteDistributionSystem=function(distributionsystem){
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
		            DistributionSystemService.deleteDistributionSystem(distributionsystem, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM";
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
							      $scope.getAllDistributionSystems();
          					$scope.$emit('handleEmitDistributionSystemChanged');
		            	} else {
		            		var templateName = "DISTRIBUTION_SYSTEM.DISTRIBUTION_SYSTEM";
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
