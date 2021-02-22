'use strict';

app.controller('WebMessageController', function($scope, $timeout, $translate, $common, $interval,	$uibModal, WebMessageAnalysisService, toaster, SweetAlert) {
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
			WebMessageAnalysisService.editWebMessage(modifiedWebmessage, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "FDD.WEB_MESSAGE";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCESS';
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


					$scope.$emit('handleEmitWebMessageTableChanged');
				} else {
					var templateName = "FDD.WEB_MESSAGE";
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
		}, function() {
			//do nothing;
		});
	};

	$scope.deleteWebMessage = function(webmessage) {
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
					WebMessageAnalysisService.deleteWebMessage(webmessage, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "FDD.WEB_MESSAGE";
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


							$scope.$emit('handleEmitWebMessageTableChanged');
						} else {
							var templateName = "FDD.WEB_MESSAGE";
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
