'use strict';

app.controller('ContactController', function($scope, $translate,$uibModal, ContactService,toaster,SweetAlert) {


	$scope.getAllContacts = function() {
		ContactService.getAllContacts(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
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
			ContactService.addContact(contact, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.CONTACT")}),
						showCloseButton: true,
					});
					$scope.getAllContacts();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.CONTACT")}),
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
	        ContactService.editContact(modifiedContact, function (response) {
	            if(angular.isDefined(response.status) && response.status === 200200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.CONTACT")}),
						showCloseButton: true,
					});
	            $scope.getAllContacts();
	            }else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.CONTACT")}),
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
		            ContactService.deleteContact(contact, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.CONTACT")}),
                                showCloseButton: true,
                            });
		            		$scope.getAllContacts();
		            	} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.FAILURE_TITLE"),
                                body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.CONTACT")}),
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
