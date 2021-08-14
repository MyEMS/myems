'use strict';

app.controller('WebMessageController', function($scope, $timeout, $translate, $uibModal, WebMessageAnalysisService, toaster, SweetAlert) {
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
			WebMessageAnalysisService.editWebMessage(modifiedWebmessage, function (response) {
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
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("FDD.WEB_MESSAGE")}),
						showCloseButton: true,
					});

				}
			});
		}, function() {
			//do nothing;
		});
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
					WebMessageAnalysisService.deleteWebMessage(webmessage, function (response) {
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
                                title: $translate.instant("TOASTER.FAILURE_TITLE"),
                                body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("FDD.WEB_MESSAGE")}),
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
