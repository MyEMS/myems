'use strict';

app.controller('ContactController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    ContactService,
    toaster,
    SweetAlert) {

	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.searchKeyword = '';
	$scope.getAllContacts = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ContactService.getAllContacts(headers, function (response) {
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			ContactService.addContact(contact, headers, function(response) {
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
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.CONTACT")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
	        ContactService.editContact(modifiedContact, headers, function (response) {
	            if(angular.isDefined(response.status) && response.status === 200){
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
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.CONTACT")}),
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
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		            ContactService.deleteContact(contact, headers, function (response) {
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
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.CONTACT")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
		            	}
		            });
		        }
		    });
	};

	let searchDebounceTimer = null;
	function safeApply(scope) {
		if (!scope.$$phase && !scope.$root.$$phase) {
			scope.$apply();
		}
	}
	$scope.searchContact = function() {
		const headers = {
			"User-UUID": $scope.cur_user?.uuid,
			"Token": $scope.cur_user?.token
		};

		const rawKeyword = $scope.searchKeyword || "";
		const trimmedKeyword = rawKeyword.trim();

		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}

		searchDebounceTimer = setTimeout(() => {
			if (!trimmedKeyword) {
				$scope.getAllContacts();
				safeApply($scope);
				return;
			}

			ContactService.searchContacts(trimmedKeyword, headers, (response) => {
				$scope.contacts = (response.status === 200) ? response.data : [];
				$scope.parentmeters = [...$scope.contacts];
			});
		}, 300);
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
