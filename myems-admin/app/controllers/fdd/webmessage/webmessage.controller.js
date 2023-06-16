'use strict';

app.controller('WebMessageController', function(
	$scope, 
	$rootScope,
	$window,
	$timeout, 
	$translate, 
	$uibModal, 
	WebMessageService,
	toaster, 
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.$on('handleBroadcastWebMessageOptionChanged', function (event, data) {
        if (angular.isDefined(data.load)) {
            $scope.tabledata = [];
            $timeout(function () {
                angular.element('#webmessageTable').trigger('footable_redraw');
            }, 0);
        } else {
            $scope.tabledata = data;
            $timeout(function () {
                angular.element('#webmessageTable').trigger('footable_redraw');
            }, 0);
        }

	});

	$scope.editWebMessage = function(webmessage) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/fdd/webmessage.model.html',
			controller: 'ModalEditWebMessageCtrl',
			resolve: {
				params: function() {
					return {
						webmessage: angular.copy(webmessage)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedWebmessage) {
			modifiedWebmessage.status = "acknowledged";
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WebMessageService.editWebMessage(modifiedWebmessage, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("FDD.WEB_MESSAGE")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitWebMessageTableChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("FDD.WEB_MESSAGE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});

				}
			});
		}, function() {
			//do nothing;
		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.deleteWebMessage = function(webmessage) {
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
			},
			function(isConfirm) {
				if (isConfirm) {
			        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
					WebMessageService.deleteWebMessage(webmessage, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("FDD.WEB_MESSAGE")}),
                                showCloseButton: true,
                            });
							$scope.$emit('handleEmitWebMessageTableChanged');
						} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("FDD.WEB_MESSAGE")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });


						}
					});
				}
			});
	};

	// $scope.getWebMessages();


});

app.controller('ModalEditWebMessageCtrl', function($scope, $uibModalInstance, params) {
	$scope.webmessage = params.webmessage;
	$scope.ok = function() {
		$uibModalInstance.close($scope.webmessage);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
