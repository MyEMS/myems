'use strict';

app.controller('EmailServerController', function($scope,
	$window,
    $translate,
    $uibModal,
    EmailServerService,
    toaster,
    SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllEmailServers = function() {
	    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EmailServerService.getAllEmailServers(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.emailservers = response.data;
			} else {
				$scope.emailservers = [];
			}
		});

	};

	$scope.addEmailServer = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/emailserver/emailserver.model.html',
			controller: 'ModalAddEmailServerCtrl',
			windowClass: "animated fadeIn",
			resolve: {
		        params:function(){
                    return {
                        emailservers:angular.copy($scope.emailservers)
                    };
                }
		    }
		});
		modalInstance.result.then(function(emailserver) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EmailServerService.addEmailServer(emailserver, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY",{template: $translate.instant("SETTING.EMAIL_SERVER")}),
						showCloseButton: true,
					});
					$scope.getAllEmailServers();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.EMAIL_SERVER")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editEmailServer=function(emailserver){
		var modalInstance = $uibModal.open({
		    windowClass: "animated fadeIn",
		    templateUrl: 'views/settings/emailserver/emailserver.model.html',
		    controller: 'ModalEditEmailServerCtrl',
		    resolve: {
		        params:function(){
                    return {
                        emailserver:angular.copy(emailserver),
                        emailservers:angular.copy($scope.emailservers)
                    };
                }
		    }
		});

		modalInstance.result.then(function (modifiedEmailServer) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
	        EmailServerService.editEmailServer(modifiedEmailServer, headers, function (response){
	            if(angular.isDefined(response.status) && response.status === 200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.EMAIL_SERVER")}),
						showCloseButton: true,
					});
	            	$scope.getAllEmailServers();
	            }else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.EMAIL_SERVER")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
	            }
	        });
		}, function () {
	        //do nothing;
		});
	};

	$scope.deleteEmailServer=function(emailserver){
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
		            EmailServerService.deleteEmailServer(emailserver, headers, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.EMAIL_SERVER")}),
                                showCloseButton: true,
                            });
		            		$scope.getAllEmailServers();
		            	} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.EMAIL_SERVER")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
		            	}
		            });
		        }
		    });
	};

	$scope.getAllEmailServers();
});

app.controller('ModalAddEmailServerCtrl', function ($scope, $uibModalInstance,params) {

    $scope.operation="SETTING.ADD_EMAIL_SERVER";
    $scope.emailservers=params.emailservers;
    $scope.ok = function () {
        $uibModalInstance.close($scope.emailserver);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditEmailServerCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation="SETTING.EDIT_EMAIL_SERVER";
    $scope.emailserver = params.emailserver;
    $scope.emailservers=params.emailservers;

    $scope.ok = function () {
        $uibModalInstance.close($scope.emailserver);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
