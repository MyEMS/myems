'use strict';

app.controller('WechatMessageController', function($scope, $timeout,$translate, WechatMessageAnalysisService, toaster, SweetAlert) {

    $scope.$on('handleBroadcastWechatMessageOptionChanged', function (event, data) {
        if (angular.isDefined(data.load)) {
            $scope.tabledata = [];
            $timeout(function () {
                angular.element('#wechatmessageTable').trigger('footable_redraw');
            }, 0);
        } else {
            $scope.tabledata = data;
            $timeout(function () {
                angular.element('#wechatmessageTable').trigger('footable_redraw');
            }, 0);
        }

    });

	$scope.deleteWechatMessage = function(wechatmessage) {
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
					WechatMessageAnalysisService.deleteWechatMessage(wechatmessage, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("FDD.WECHAT_MESSAGE")}),
                                showCloseButton: true,
                            });
							
                            $scope.$emit('handleEmitWechatMessageTableChanged');
						} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("FDD.WECHAT_MESSAGE")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
                        }
					});
				}
			});
	};
});
