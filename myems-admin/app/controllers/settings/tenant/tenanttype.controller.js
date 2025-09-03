'use strict';

app.controller('TenantTypeController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    TenantTypeService, 
    toaster,
    SweetAlert
) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user")) || {};
    $scope.tenantTypes = []; 

    $scope.getAllTenantTypes = function() {
        const headers = { 
            "User-UUID": $scope.cur_user.uuid, 
            "Token": $scope.cur_user.token 
        };
        TenantTypeService.getAllTenantTypes(headers, function(response) {
            if (response.status === 200) {
                $scope.tenantTypes = response.data; 
            } else {
                $scope.tenantTypes = [];
                toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), 
                    $translate.instant("TOASTER.FAILED_TO_FETCH", { template: $translate.instant("SETTING.TENANT_TYPE") })
                );
            }
        });
    };

    $scope.addTenantType = function() {
        const modalInstance = $uibModal.open({
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
            const headers = { 
                "User-UUID": $scope.cur_user.uuid, 
                "Token": $scope.cur_user.token 
            };
            TenantTypeService.addTenantType(tenantType, headers, function(response) {
                if (response.status === 201) {
                    toaster.pop('success', $translate.instant("TOASTER.SUCCESS_TITLE"), 
                        $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("SETTING.TENANT_TYPE") })
                    );
                    $scope.getAllTenantTypes(); 
                } else {
                    toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), 
                        $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("SETTING.TENANT_TYPE") })
                    );
                }
            });
        });

        $rootScope.modalInstance = modalInstance;
    };

    $scope.editTenantType = function(tenantType) { 
        const modalInstance = $uibModal.open({
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
            const headers = { 
                "User-UUID": $scope.cur_user.uuid, 
                "Token": $scope.cur_user.token 
            };
            TenantTypeService.editTenantType(modifiedTenantType, headers, function(response) {
                if (response.status === 200) {
                    toaster.pop('success', $translate.instant("TOASTER.SUCCESS_TITLE"), 
                        $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("SETTING.TENANT_TYPE") })
                    );
                    $scope.getAllTenantTypes(); 
                } else {
                    toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), 
                        $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("SETTING.TENANT_TYPE") })
                    );
                }
            });
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
    params,
    toaster,
    $translate
) {
    $scope.operation = "SETTING.ADD_TENANT_TYPE"; 
    $scope.tenantTypes = params.tenantTypes; 
    $scope.tenantType = {}; 

    $scope.ok = function() {
        if (!($scope.tenantType.name && $scope.tenantType.name.trim())) {
            toaster.pop('warning', $translate.instant("TOASTER.WARNING_TITLE"), 
                $translate.instant("TOASTER.INPUT_NAME")
            );
            return;
        }
        const isDuplicate = $scope.tenantTypes.some(type => 
            type.name.toLowerCase() === $scope.tenantType.name.toLowerCase()
        );
        if (isDuplicate) {
            toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), 
                $translate.instant("TOASTER.DUPLICATE_NAME")
            );
            return;
        }
        $uibModalInstance.close($scope.tenantType);
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditTenantTypeCtrl', function(
    $scope,
    $uibModalInstance,
    params,
    toaster,
    $translate
) {
    $scope.operation = "SETTING.EDIT_TENANT_TYPE"; 
    $scope.tenantType = params.tenantType; 
    $scope.tenantTypes = params.tenantTypes; 

    $scope.ok = function() {
        if (!($scope.tenantType.name && $scope.tenantType.name.trim())) {
            toaster.pop('warning', $translate.instant("TOASTER.WARNING_TITLE"), 
                $translate.instant("TOASTER.INPUT_NAME")
            );
            return;
        }
        const isDuplicate = $scope.tenantTypes.some(type => 
            type.id !== $scope.tenantType.id && 
            type.name.toLowerCase() === $scope.tenantType.name.toLowerCase()
        );
        if (isDuplicate) {
            toaster.pop('error', $translate.instant("TOASTER.ERROR_TITLE"), 
                $translate.instant("TOASTER.DUPLICATE_NAME")
            );
            return;
        }
        $uibModalInstance.close($scope.tenantType);
    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}); 