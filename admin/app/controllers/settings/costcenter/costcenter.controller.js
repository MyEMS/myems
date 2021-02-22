'use strict';

app.controller('CostCenterController', function($scope,$common, $translate,$uibModal, CostCenterService,toaster,SweetAlert) {

	$scope.getAllCostCenters = function() {
		CostCenterService.getAllCostCenters(function(error, data) {
			if (!error) {
				$scope.costcenters = data;
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
			CostCenterService.addCostCenter(costcenter, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "SETTING.COSTCENTER";
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

					$scope.getAllCostCenters();
					$scope.$emit('handleEmitCostCenterChanged');
				} else {
					var templateName = "SETTING.COSTCENTER";
					templateName = $translate.instant(templateName);

					var popType = 'SETTING.COSTCENTER';
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
	        CostCenterService.editCostCenter(modifiedCostCenter,function(error,status){
	            if(angular.isDefined(status) && status==200){
								var templateName = "SETTING.COSTCENTER";
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
			          $scope.getAllCostCenters();
								$scope.$emit('handleEmitCostCenterChanged');
		      }else{
		          var templateName = "SETTING.COSTCENTER";
							templateName = $translate.instant(templateName);

							var popType = 'SETTING.COSTCENTER';
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
		}, function () {
	        //do nothing;
		});
	};

	$scope.deleteCostCenter=function(costcenter){
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
		            CostCenterService.deleteCostCenter(costcenter, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "SETTING.COSTCENTER";
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
		            		$scope.getAllCostCenters();
										$scope.$emit('handleEmitCostCenterChanged');
		            	} else if (angular.isDefined(status) && status == 400) {
										var popType = 'SETTING.COSTCENTER';
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
		            		var templateName = "SETTING.COSTCENTER";
                    templateName = $translate.instant(templateName);

                    var popType = 'SETTING.COSTCENTER';
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
