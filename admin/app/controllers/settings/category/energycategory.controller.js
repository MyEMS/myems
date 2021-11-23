'use strict';

app.controller('EnergyCategoryController', function($scope, $translate,$uibModal, CategoryService,toaster,SweetAlert) {

	$scope.getAllCategories = function() {
		CategoryService.getAllCategories(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.categories = response.data;
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			CategoryService.addCategory(category, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("SETTING.CATEGORY")}),
						showCloseButton: true,
					});

					$scope.getAllCategories();
					$scope.$emit('handleEmitEnergyCategoryChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.CATEGORY")}),
						body: $translate.instant(response.data.description),
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
	        CategoryService.editCategory(modifiedCategory, headers, function (response) {
	            if(angular.isDefined(response.status) && response.status === 200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.CATEGORY")}),
						showCloseButton: true,
					});

					$scope.getAllCategories();
					$scope.$emit('handleEmitEnergyCategoryChanged');
				}else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.CATEGORY")}),
						body: $translate.instant(response.data.description),
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
				CategoryService.deleteCategory(category, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 204) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.CATEGORY")}),
							showCloseButton: true,
						});
						$scope.getAllCategories();
						$scope.$emit('handleEmitEnergyCategoryChanged');
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.CATEGORY")}),
							body: $translate.instant(response.data.description),
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
