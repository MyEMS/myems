'use strict';

app.controller('IoTSIMCardController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    IoTSIMCardService,
    toaster,
    SweetAlert) {

	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllIoTSIMCards = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		IoTSIMCardService.getAllIoTSIMCards(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.iotsimcards = response.data;
			} else {
				$scope.iotsimcards = [];
			}
		});

	};

	$scope.addIoTSIMCard = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/iotsimcard/iotsimcard.model.html',
			controller: 'ModalAddIoTSIMCardCtrl',
			windowClass: "animated fadeIn",
			resolve: {
		        params:function(){
                    return {
                        iotsimcards:angular.copy($scope.iotsimcards)
                    };
                }
		    }
		});
		modalInstance.result.then(function(iotsimcard) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			IoTSIMCardService.addIoTSIMCard(iotsimcard, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.iotsimcard")}),
						showCloseButton: true,
					});
					$scope.getAllIoTSIMCards();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.iotsimcard")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editIoTSIMCard=function(iotsimcard){
		var modalInstance = $uibModal.open({
		    windowClass: "animated fadeIn",
		    templateUrl: 'views/settings/iotsimcard/iotsimcard.model.html',
		    controller: 'ModalEditIoTSIMCardCtrl',
		    resolve: {
		        params:function(){
                    return {
                        iotsimcard:angular.copy(iotsimcard),
                        iotsimcards:angular.copy($scope.iotsimcards)
                    };
                }
		    }
		});

		modalInstance.result.then(function (modifiedIoTSIMCard) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
	        IoTSIMCardService.editIoTSIMCard(modifiedIoTSIMCard, headers, function (response) {
	            if(angular.isDefined(response.status) && response.status === 200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.iotsimcard")}),
						showCloseButton: true,
					});
	            $scope.getAllIoTSIMCards();
	            }else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.iotsimcard")}),
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

	$scope.deleteIoTSIMCard=function(iotsimcard){
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
		            IoTSIMCardService.deleteIoTSIMCard(iotsimcard, headers, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.iotsimcard")}),
                                showCloseButton: true,
                            });
		            		$scope.getAllIoTSIMCards();
		            	} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.iotsimcard")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
		            	}
		            });
		        }
		    });
	};

	$scope.getAllIoTSIMCards();
});

app.controller('ModalAddIoTSIMCardCtrl', function ($scope, $uibModalInstance,params) {

    $scope.operation="IOTSIMCARD.ADD_IOTSIMCARD";
    $scope.iotsimcards=params.iotsimcards;
    $scope.ok = function () {
        $uibModalInstance.close($scope.iotsimcard);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditIoTSIMCardCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation="IOTSIMCARD.EDIT_IOTSIMCARD";
    $scope.iotsimcard = params.iotsimcard;
    $scope.iotsimcards=params.iotsimcards;

    $scope.ok = function () {
        $uibModalInstance.close($scope.iotsimcard);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
