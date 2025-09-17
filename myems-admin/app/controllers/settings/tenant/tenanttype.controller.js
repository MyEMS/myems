'use strict';

app.controller('TenantTypeController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    TenantTypeService, 
    toaster,
    SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user")); 
    $scope.getAllTenantTypes = function() {
        let headers = { 
            "User-UUID": $scope.cur_user.uuid, 
            "Token": $scope.cur_user.token 
        };
        TenantTypeService.getAllTenantTypes(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenantTypes = response.data; 
            } else {
                $scope.tenantTypes = [];
            }
        });
    };

    $scope.addTenantType = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/settings/tenant/tenanttype.model.html',
            controller: 'ModalAddTenantTypeCtrl',
            windowClass: "animated fadeIn",
            resolve: {
                params: function() {
                    return {
                        tenantTypes: angular.copy($scope.tenantTypes) 
                    };
                }
            }
        });
        modalInstance.result.then(function(tenantType) {
			let headers = { 
                "User-UUID": $scope.cur_user.uuid, 
                "Token": $scope.cur_user.token 
            };
		TenantTypeService.addTenantType(tenantType, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("SETTING.TENANT_TYPE")}),
						showCloseButton: true,
					});

					$scope.getAllTenantTypes(); 
					$scope.$emit('handleEmitTenantTypeChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.TENANT_TYPE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});

        $rootScope.modalInstance = modalInstance;
    };

    $scope.editTenantType = function(tenantType) { 
        var modalInstance = $uibModal.open({
            templateUrl: 'views/settings/tenant/tenanttype.model.html',
            controller: 'ModalEditTenantTypeCtrl',
            windowClass: "animated fadeIn",
            resolve: {
                params: function() {
                    return {
                        tenantType: angular.copy(tenantType), 
                        tenantTypes: angular.copy($scope.tenantTypes) 
                    };
                }
            }
        });

        modalInstance.result.then(function(modifiedTenantType) {
			let headers = { 
                "User-UUID": $scope.cur_user.uuid, 
                "Token": $scope.cur_user.token };
	        TenantTypeService.editTenantType(modifiedTenantType, headers, function(response) {
	            if(angular.isDefined(response.status) && response.status === 200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.TENANT_TYPE")}),
						showCloseButton: true,
					});

					$scope.getAllTenantTypes(); 
					$scope.$emit('handleEmitTenantTypeChanged');
				}else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.TENANT_TYPE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
	       
		});
        $rootScope.modalInstance = modalInstance;
    };

    $scope.deleteTenantType = function(tenantType) { 
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
                TenantTypeService.deleteTenantType(tenantType, headers, function(response) {
                    if (response.status === 204) {
                        toaster.pop('success', $translate.instant("TOASTER.SUCCESS_TITLE"), 
                            $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("SETTING.TENANT_TYPE") })
                        );
                        $scope.getAllTenantTypes(); 
                        $scope.$emit('handleEmitTenantTypeChanged');
                    } else {
                        toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), 
                            $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("SETTING.TENANT_TYPE") })
                        );
                    }
                });
            }
        });
    };

    $scope.getAllTenantTypes();
});

app.controller('ModalAddTenantTypeCtrl', function(
    $scope,
    $uibModalInstance,
    params 
) {
    $scope.operation = "SETTING.ADD_TENANT_TYPE"; 
    $scope.tenantTypes = params.tenantTypes; 
    $scope.tenantType = {}; 

    $scope.ok = function() {
        $uibModalInstance.close($scope.tenantType);
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditTenantTypeCtrl', function(
    $scope,
    $uibModalInstance,
    params
) {
    $scope.operation = "SETTING.EDIT_TENANT_TYPE"; 
    $scope.tenantType = params.tenantType; 
    $scope.tenantTypes = params.tenantTypes; 

    $scope.ok = function() {
        $uibModalInstance.close($scope.tenantType);
    };
    
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});