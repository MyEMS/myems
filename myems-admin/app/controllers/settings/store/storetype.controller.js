'use strict';

app.controller('StoreTypeController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    StoreTypeService, 
    toaster,
    SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user")); 
    $scope.getAllStoreTypes = function() {
        let headers = { 
            "User-UUID": $scope.cur_user.uuid, 
            "Token": $scope.cur_user.token 
        };
        StoreTypeService.getAllStoreTypes(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.storeTypes = response.data; 
            } else {
                $scope.storeTypes = [];
            }
        });
    };

    $scope.addStoreType = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/settings/store/storetype.model.html',
            controller: 'ModalAddStoreTypeCtrl',
            windowClass: "animated fadeIn",
            resolve: {
                params: function() {
                    return {
                        storeTypes: angular.copy($scope.storeTypes) 
                    };
                }
            }
        });
        modalInstance.result.then(function(storeType) {
			let headers = { 
                "User-UUID": $scope.cur_user.uuid, 
                "Token": $scope.cur_user.token 
            };
		StoreTypeService.addStoreType(storeType, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("SETTING.STORE_TYPE")}),
						showCloseButton: true,
					});

					$scope.getAllStoreTypes(); 
					$scope.$emit('handleEmitStoreTypeChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.STORE_TYPE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});

        $rootScope.modalInstance = modalInstance;
    };

    $scope.editStoreType = function(storeType) { 
        var modalInstance = $uibModal.open({
            templateUrl: 'views/settings/store/storetype.model.html',
            controller: 'ModalEditStoreTypeCtrl',
            windowClass: "animated fadeIn",
            resolve: {
                params: function() {
                    return {
                        storeType: angular.copy(storeType), 
                        storeTypes: angular.copy($scope.storeTypes) 
                    };
                }
            }
        });

        modalInstance.result.then(function(modifiedStoreType) {
			let headers = { 
                "User-UUID": $scope.cur_user.uuid, 
                "Token": $scope.cur_user.token };
	        StoreTypeService.editStoreType(modifiedStoreType, headers, function(response) {
	            if(angular.isDefined(response.status) && response.status === 200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.STORE_TYPE")}),
						showCloseButton: true,
					});

					$scope.getAllStoreTypes(); 
					$scope.$emit('handleEmitStoreTypeChanged');
				}else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.STORE_TYPE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
	       
		});
        $rootScope.modalInstance = modalInstance;
    };

    $scope.deleteStoreType = function(storeType) { 
        SweetAlert.swal({
            title: $translate.instant("SWEET.TITLE"),
            text: $translate.instant("SWEET.TEXT"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
            cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm) {
               if (isConfirm) {
                   const headers = { 
                       "User-UUID": $scope.cur_user.uuid, 
                       "Token": $scope.cur_user.token 
                   };
                   StoreTypeService.deleteStoreType(storeType, headers, function(response) {
                       if (response.status === 204) {
                           toaster.pop('success', $translate.instant("TOASTER.SUCCESS_TITLE"), 
                           $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("SETTING.STORE_TYPE") })
                        );
                           $scope.getAllStoreTypes(); 
                           $scope.$emit('handleEmitStoreTypeChanged');
                       } else {
                           toaster.pop({
                               type: "error",
                               title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.STORE_TYPE")}),
                               body: $translate.instant(response.data.description),
                               showCloseButton: true,
                               });
                          }
                   });
               }
           });
    };

    $scope.getAllStoreTypes();
});

app.controller('ModalAddStoreTypeCtrl', function(
    $scope,
    $uibModalInstance,
    params 
) {
    $scope.operation = "SETTING.ADD_STORE_TYPE"; 
    $scope.storeTypes = params.storeTypes; 
    $scope.storeType = {}; 

    $scope.ok = function() {
        $uibModalInstance.close($scope.storeType);
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditStoreTypeCtrl', function(
    $scope,
    $uibModalInstance,
    params
) {
    $scope.operation = "SETTING.EDIT_STORE_TYPE"; 
    $scope.storeType = params.storeType; 
    $scope.storeTypes = params.storeTypes; 

    $scope.ok = function() {
        $uibModalInstance.close($scope.storeType);
    };
    
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});

