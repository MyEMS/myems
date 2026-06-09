'use strict';

// Energy Item controller - CRUD and settings management

app.controller('EnergyItemController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CategoryService,
    EnergyItemService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	// Load all categories from API
	$scope.getAllCategories = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CategoryService.getAllCategories(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.categories = response.data;
			} else {
				$scope.categories = [];
			}
		});

	};

	// Load all energy items from API
	$scope.getAllEnergyItems = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyItemService.getAllEnergyItems(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energyItems = response.data;
			} else {
				$scope.energyItems = [];
			}
		});

	};

	// Open add modal and create energy item
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EnergyItemService.addEnergyItem(energyItem, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.ENERGY_ITEM")}),
						showCloseButton: true,
					});
					$scope.getAllEnergyItems();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.ENERGY_ITEM")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	// Open edit modal and update energy item
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
	        EnergyItemService.editEnergyItem(modifiedEnergyItem, headers, function (response){
	            if(angular.isDefined(response.status) && response.status === 200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.ENERGY_ITEM")}),
						showCloseButton: true,
					});
	                $scope.getAllEnergyItems();
	            }else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.ENERGY_ITEM")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
	            }
	        });
		}, function () {
	        //do nothing;
		});
		$rootScope.modalInstance = modalInstance;
	};

	// Confirm and delete energy item
	$scope.deleteEnergyItem=function(energyItem){
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
		            EnergyItemService.deleteEnergyItem(energyItem, headers, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.ENERGY_ITEM")}),
								showCloseButton: true,
							});
							$scope.getAllEnergyItems();
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.ENERGY_ITEM")}),
								body: $translate.instant(response.data.description),
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

// Modal controller for add dialog
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

// Modal controller for edit dialog
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
