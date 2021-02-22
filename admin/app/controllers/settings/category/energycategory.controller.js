'use strict';

app.controller('EnergyCategoryController', function($scope,$common, $translate,$uibModal, CategoryService,toaster,SweetAlert) {


	$scope.getAllCategories = function() {
		CategoryService.getAllCategories(function(error, data) {
			if (!error) {
				$scope.categories = data;
			} else {
				$scope.categories = [];
			}
		});

	};

	$scope.addCategory = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/category/category.model.html',
			controller: 'ModalAddCategoryCtrl',
			windowClass: "animated fadeIn",
			resolve: {
		        params:function(){
                    return {
                        categories:angular.copy($scope.categories)
                    };
                }
		    }
		});
		modalInstance.result.then(function(category) {
			CategoryService.addCategory(category, function(error, status) {
				if (angular.isDefined(status) && status == 201) {

					var templateName = "SETTING.CATEGORY";
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

					$scope.getAllCategories();
					$scope.$emit('handleEmitEnergyCategoryChanged');
				} else {
					var templateName = "SETTING.CATEGORY";
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

	$scope.editCategory=function(category){
		var modalInstance = $uibModal.open({
		    windowClass: "animated fadeIn",
		    templateUrl: 'views/settings/category/category.model.html',
		    controller: 'ModalEditCategoryCtrl',
		    resolve: {
		        params:function(){
                    return {
                        category:angular.copy(category),
                        categories:angular.copy($scope.categories)
                    };
                }
		    }
		});

		modalInstance.result.then(function (modifiedCategory) {
	        CategoryService.editCategory(modifiedCategory,function(error,status){
	            if(angular.isDefined(status) && status==200){
	            	var templateName = "SETTING.CATEGORY";
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

          $scope.getAllCategories();
					$scope.$emit('handleEmitEnergyCategoryChanged');
      }else{
          var templateName = "SETTING.CATEGORY";
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

	$scope.deleteCategory=function(category){
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
		            CategoryService.deleteCategory(category, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "SETTING.CATEGORY";
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
		            		$scope.getAllCategories();
										$scope.$emit('handleEmitEnergyCategoryChanged');
		            	} else {
		            		var templateName = "SETTING.CATEGORY";
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

	$scope.getAllCategories();

});

app.controller('ModalAddCategoryCtrl', function ($scope, $uibModalInstance,params) {

    $scope.operation="SETTING.ADD_CATEGORY";
    $scope.categories=params.categories;
    $scope.ok = function () {
        $uibModalInstance.close($scope.category);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditCategoryCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation="SETTING.EDIT_CATEGORY";
    $scope.category = params.category;
    $scope.categories=params.categories;

    $scope.ok = function () {
        $uibModalInstance.close($scope.category);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
