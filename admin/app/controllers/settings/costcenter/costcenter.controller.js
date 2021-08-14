'use strict';

app.controller('CostCenterController', function($scope, $translate,$uibModal, CostCenterService,toaster,SweetAlert) {

	$scope.getAllCostCenters = function() {
		CostCenterService.getAllCostCenters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.addCostCenter = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/costcenter/costcenter.model.html',
			controller: 'ModalAddCostCenterCtrl',
			windowClass: "animated fadeIn",
		});
		modalInstance.result.then(function(costcenter) {
			CostCenterService.addCostCenter(costcenter, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.COSTCENTER")}),
						showCloseButton: true,
					});

					$scope.getAllCostCenters();
					$scope.$emit('handleEmitCostCenterChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.COSTCENTER")}),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editCostCenter=function(costcenter){
		var modalInstance = $uibModal.open({
		    windowClass: "animated fadeIn",
		    templateUrl: 'views/settings/costcenter/costcenter.model.html',
		    controller: 'ModalEditCostCenterCtrl',
		    resolve: {
		        params:function(){
                    return {
                        costcenter:angular.copy(costcenter),
                        costcenters:angular.copy($scope.costcenters)
                    };
                }
		    }
		});

		modalInstance.result.then(function (modifiedCostCenter) {
	        CostCenterService.editCostCenter(modifiedCostCenter, function (response){
	            if(angular.isDefined(response.status) && response.status === 200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.COSTCENTER")}),
						showCloseButton: true,
					});
			        $scope.getAllCostCenters();
					$scope.$emit('handleEmitCostCenterChanged');
		      }else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.COSTCENTER")}),
						showCloseButton: true,
					});
				}
	        });
		}, function () {
	        //do nothing;
		});
	};

	$scope.deleteCostCenter=function(costcenter){
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
		            CostCenterService.deleteCostCenter(costcenter, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.COSTCENTER")}),
								showCloseButton: true,
							});
		            		$scope.getAllCostCenters();
							$scope.$emit('handleEmitCostCenterChanged');
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
                        body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.COSTCENTER")}),
                        showCloseButton: true,
                    });
		            	}
		            });
		        }
		    });
	};

	$scope.getAllCostCenters();

});

app.controller('ModalAddCostCenterCtrl', function ($scope, $uibModalInstance) {

    $scope.operation="SETTING.ADD_COSTCENTER";
    $scope.ok = function () {
        $uibModalInstance.close($scope.costcenter);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditCostCenterCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation="SETTING.EDIT_COSTCENTER";
    $scope.costcenter = params.costcenter;
    $scope.costcenters=params.costcenters;

    $scope.ok = function () {
        $uibModalInstance.close($scope.costcenter);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
