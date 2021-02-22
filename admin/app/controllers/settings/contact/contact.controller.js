'use strict';

app.controller('ContactController', function($scope,$common, $translate,$uibModal, ContactService,toaster,SweetAlert) {


	$scope.getAllContacts = function() {
		ContactService.getAllContacts(function(error, data) {
			if (!error) {
				$scope.contacts = data;
			} else {
				$scope.contacts = [];
			}
		});

	};

	$scope.addContact = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/contact/contact.model.html',
			controller: 'ModalAddContactCtrl',
			windowClass: "animated fadeIn",
			resolve: {
		        params:function(){
                    return {
                        contacts:angular.copy($scope.contacts)
                    };
                }
		    }
		});
		modalInstance.result.then(function(contact) {
			ContactService.addContact(contact, function(error, status) {
				if (angular.isDefined(status) && status == 201) {

					var templateName = "SETTING.CONTACT";
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


					$scope.getAllContacts();
				} else {
					var templateName = "SETTING.CONTACT";
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

	$scope.editContact=function(contact){
		var modalInstance = $uibModal.open({
		    windowClass: "animated fadeIn",
		    templateUrl: 'views/settings/contact/contact.model.html',
		    controller: 'ModalEditContactCtrl',
		    resolve: {
		        params:function(){
                    return {
                        contact:angular.copy(contact),
                        contacts:angular.copy($scope.contacts)
                    };
                }
		    }
		});

		modalInstance.result.then(function (modifiedContact) {
	        ContactService.editContact(modifiedContact,function(error,status){
	            if(angular.isDefined(status) && status==200){
	            	var templateName = "SETTING.CONTACT";
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


	            $scope.getAllContacts();
	            }else{
	                var templateName = "SETTING.CONTACT";
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

	$scope.deleteContact=function(contact){
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
		            ContactService.deleteContact(contact, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "SETTING.CONTACT";
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
		            		$scope.getAllContacts();
		            	} else {
		            		var templateName = "SETTING.CONTACT";
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

	$scope.getAllContacts();
});

app.controller('ModalAddContactCtrl', function ($scope, $uibModalInstance,params) {

    $scope.operation="SETTING.ADD_CONTACT";
    $scope.contacts=params.contacts;
    $scope.ok = function () {
        $uibModalInstance.close($scope.contact);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditContactCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation="SETTING.EDIT_CONTACT";
    $scope.contact = params.contact;
    $scope.contacts=params.contacts;

    $scope.ok = function () {
        $uibModalInstance.close($scope.contact);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
