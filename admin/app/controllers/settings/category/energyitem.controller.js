'use strict';

app.controller('EnergyItemController', function($scope,$common, $translate,$uibModal, CategoryService, EnergyItemService, toaster,SweetAlert) {


	$scope.getAllCategories = function() {
		CategoryService.getAllCategories(function(error, data) {
			if (!error) {
				$scope.categories = data;
			} else {
				$scope.categories = [];
			}
		});

	};

	$scope.getAllEnergyItems = function() {
		EnergyItemService.getAllEnergyItems(function(error, data) {
			if (!error) {
				$scope.energyItems = data;
			} else {
				$scope.energyItems = [];
			}
		});

	};

	$scope.addEnergyItem = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/category/energyitem.model.html',
			controller: 'ModalAddEnergyItemCtrl',
			windowClass: "animated fadeIn",
			resolve: {
		        params:function(){
                    return {
                        energyItems:angular.copy($scope.energyItems),
		                    categories:angular.copy($scope.categories)
                    };
                }
		    }
		});
		modalInstance.result.then(function(energyItem) {
			EnergyItemService.addEnergyItem(energyItem, function(error, status) {
				if (angular.isDefined(status) && status == 201) {

					var templateName = "SETTING.ENERGY_ITEM";
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

					$scope.getAllEnergyItems();
				} else {
					var templateName = "SETTING.ENERGY_ITEM";
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

	$scope.editEnergyItem=function(energyItem){
		var modalInstance = $uibModal.open({
		    windowClass: "animated fadeIn",
		    templateUrl: 'views/settings/category/energyitem.model.html',
		    controller: 'ModalEditEnergyItemCtrl',
		    resolve: {
		        params:function(){
                    return {
                        energyItem:angular.copy(energyItem),
                        energyItems:angular.copy($scope.energyItems),
                        categories:angular.copy($scope.categories)
                    };
                }
		    }
		});

		modalInstance.result.then(function (modifiedEnergyItem) {
	        EnergyItemService.editEnergyItem(modifiedEnergyItem,function(error,status){
	            if(angular.isDefined(status) && status==200){
	            	var templateName = "SETTING.ENERGY_ITEM";
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
	                $scope.getAllEnergyItems();
	            }else{
	                var templateName = "SETTING.ENERGY_ITEM";
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
		}, function () {
	        //do nothing;
		});
	};

	$scope.deleteEnergyItem=function(energyItem){
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
		            EnergyItemService.deleteEnergyItem(energyItem, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "SETTING.ENERGY_ITEM";
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
		            		$scope.getAllEnergyItems();
		            	} else {
		            		var templateName = "SETTING.ENERGY_ITEM";
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

	$scope.getAllEnergyItems();
	$scope.getAllCategories();

	$scope.$on('handleBroadcastEnergyCategoryChanged', function(event) {
		$scope.getAllCategories();
	});
});

app.controller('ModalAddEnergyItemCtrl', function ($scope, $uibModalInstance,params) {

	  $scope.operation="SETTING.ADD_ENERGY_ITEM";
    $scope.energyItems=params.energyItems;
		$scope.categories=params.categories;
    $scope.ok = function () {
        $uibModalInstance.close($scope.energyItem);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditEnergyItemCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation="SETTING.EDIT_ENERGY_ITEM";
    $scope.energyItem = params.energyItem;
    $scope.energyItems=params.energyItems;
		$scope.categories=params.categories;
    if($scope.energyItem.energy_category!=null){
			$scope.energyItem.energy_category_id=$scope.energyItem.energy_category.id ;
	  }else{
			$scope.energyItem.energy_category_id=undefined;
  	}

    $scope.ok = function () {
        $uibModalInstance.close($scope.energyItem);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
