'use strict';

app.controller('EmailServerController', function($scope,$common, $translate,$uibModal, EmailServerService,toaster,SweetAlert) {


	$scope.getAllEmailServers = function() {
		EmailServerService.getAllEmailServers(function(error, data) {
			if (!error) {
				$scope.emailservers = data;
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
			EmailServerService.addEmailServer(emailserver, function(error, status) {
				if (angular.isDefined(status) && status == 201) {

					var templateName = "SETTING.EMAIL_SERVER";
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


					$scope.getAllEmailServers();
				} else {
					var templateName = "SETTING.EMAIL_SERVER";
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
	        EmailServerService.editEmailServer(modifiedEmailServer,function(error,status){
	            if(angular.isDefined(status) && status==200){
	            	var templateName = "SETTING.EMAIL_SERVER";
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


	            $scope.getAllEmailServers();
	            }else{
	                var templateName = "SETTING.EMAIL_SERVER";
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

	$scope.deleteEmailServer=function(emailserver){
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
		            EmailServerService.deleteEmailServer(emailserver, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "SETTING.EMAIL_SERVER";
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
		            		$scope.getAllEmailServers();
		            	} else {
		            		var templateName = "SETTING.EMAIL_SERVER";
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
