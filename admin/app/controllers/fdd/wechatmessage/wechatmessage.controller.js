'use strict';

app.controller('WechatMessageController', function($scope, $timeout,$translate,
	$common,
	$interval,
 WechatMessageAnalysisService,
	toaster, SweetAlert) {

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
				title: $translate.instant($common.sweet.title),
				text: $translate.instant($common.sweet.text),
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: $translate.instant($common.sweet.confirmButtonText),
				cancelButtonText: $translate.instant($common.sweet.cancelButtonText),
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function(isConfirm) {
				if (isConfirm) {
					WechatMessageAnalysisService.deleteWechatMessage(wechatmessage, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "FDD.WECHAT_MESSAGE";
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
							$scope.getWechatMessages();
						} else {
							var templateName = "FDD.WECHAT_MESSAGE";
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
	// $scope.getWechatMessages();
});
