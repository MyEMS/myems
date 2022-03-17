'use strict';

app.controller('TextMessageController', function(
    $scope,
    $window,
    $timeout,
    $translate,
	TextMessageService,
	SweetAlert,
	toaster) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.$on('handleBroadcastTextMessageOptionChanged', function (event, data) {
        if (angular.isDefined(data.load)) {
            $scope.tabledata = [];
            $timeout(function () {
                angular.element('#textmessageTable').trigger('footable_redraw');
            }, 0);
        } else {
            $scope.tabledata = data;
            $timeout(function () {
                angular.element('#textmessageTable').trigger('footable_redraw');
            }, 0);
        }

    });

	$scope.deleteTextMessage = function(textmessage) {
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
					TextMessageService.deleteTextMessage(textmessage, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("FDD.TEXT_MESSAGE")}),
                                showCloseButton: true,
                            });

							$scope.$emit('handleEmitTextMessageTableChanged');
						} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("FDD.TEXT_MESSAGE")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
						}
					});
				}
			}
		);
	};
});
