'use strict';
app.controller('PersonalTokenController', function (
    $scope,
	$window,
	$uibModal,
	PersonalTokenService,
	toaster,
	$translate,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllPersonalTokens = function () {
		PersonalTokenService.getAllPersonalTokens(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.personalTokens = response.data;
			} else {
				$scope.personalTokens = [];
			}
		});

	};

	$scope.addPersonalToken = function () {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/users/personaltoken/personaltoken.model.html',
			controller: 'ModalAddPersonalTokenCtrl',
			windowClass: "animated fadeIn",
		});
		modalInstance.result.then(function (personalToken) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			PersonalTokenService.addPersonalToken(personalToken, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("USER.PERSONAL_TOKEN") }),
						showCloseButton: true,
					});
					$scope.getAllPersonalTokens();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("USER.PERSONAL_TOKEN") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {

		});
	};

	$scope.editPersonalToken = function (personalToken) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/users/personaltoken/personaltoken.model.html',
			controller: 'ModalEditPersonalTokenCtrl',
			resolve: {
				params: function () {
					return {
						personalToken: angular.copy(personalToken)
					};
				}
			}
		});
		modalInstance.result.then(function (modifiedPersonalToken) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			PersonalTokenService.editPersonalToken(modifiedPersonalToken, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("USER.PERSONAL_TOKEN") }),
						showCloseButton: true,
					});
					$scope.getAllPersonalTokens();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("USER.PERSONAL_TOKEN") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
	};

	$scope.deletePersonalToken = function (personalToken) {
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
		function (isConfirm) {
			if (isConfirm) {
				let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
				PersonalTokenService.deletePersonalToken(personalToken, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 204) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("USER.PERSONAL_TOKEN") }),
							showCloseButton: true,
						});
						$scope.getAllPersonalTokens();
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("USER.PERSONAL_TOKEN") }),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}
		});
	};

	$scope.getAllPersonalTokens();

});

app.controller('ModalAddPersonalTokenCtrl', function ($scope, $uibModalInstance) {
	$scope.operation = "USER.ADD_PERSONAL_TOKEN";
	$scope.personalToken = {
		created_datetime_utc:moment(),
        expires_datetime_utc:moment().add(1,'years'),
	};
	$scope.flag = false;
	$scope.dtOptions = {
        locale:{
            format: 'YYYY-MM-DD HH:mm:ss',
            applyLabel: "OK",
            cancelLabel: "Cancel",
        },
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 15,
        singleDatePicker: true,
    };
	$scope.ok = function () {
		$scope.personalToken.created_datetime_utc = $scope.personalToken.created_datetime_utc.format().slice(0,19);
        $scope.personalToken.expires_datetime_utc = $scope.personalToken.expires_datetime_utc.format().slice(0,19);
		$uibModalInstance.close($scope.personalToken);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditPersonalTokenCtrl', function ($scope, 
	$uibModalInstance, 
	params) {
	$scope.operation = "USER.EDIT_PERSONAL_TOKEN";
	$scope.personalToken = params.personalToken;
	$scope.flag = false;
	$scope.dtOptions = {
        locale:{
            format: 'YYYY-MM-DD HH:mm:ss',
            applyLabel: "OK",
            cancelLabel: "Cancel",
        },
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 15,
        singleDatePicker: true,
    };

	$scope.ok = function () {
		$scope.personalToken.created_datetime_utc = moment($scope.personalToken.created_datetime_utc).format().slice(0,19);
        $scope.personalToken.expires_datetime_utc = moment($scope.personalToken.expires_datetime_utc).format().slice(0,19);
		$uibModalInstance.close($scope.personalToken);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

});
