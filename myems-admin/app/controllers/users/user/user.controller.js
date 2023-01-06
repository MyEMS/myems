'use strict';

app.controller('UserController', function ($scope,
	$window,
	$uibModal,
	UserService,
	PrivilegeService,
	toaster,
	$translate,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllUsers = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		UserService.getAllUsers(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.users = response.data;
			} else {
				$scope.users = [];
			}
		});
	};

	$scope.getAllPrivileges = function () {
		PrivilegeService.getAllPrivileges(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.privileges = response.data;
			} else {
				$scope.privileges = [];
			}
		});

	};

	$scope.addUser = function () {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/users/user/user.model.html',
			controller: 'ModalAddUserCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function () {
					return {
						privileges: angular.copy($scope.privileges)
					};
				}
			}
		});
		modalInstance.result.then(function (user) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			UserService.addUser(user, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("SETTING.USER") }),
						showCloseButton: true,
					});
					$scope.getAllUsers();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("SETTING.USER") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {

		});
	};

	$scope.editUser = function (user) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/users/user/user.model.html',
			controller: 'ModalEditUserCtrl',
			resolve: {
				params: function () {
					return {
						user: angular.copy(user),
						privileges: angular.copy($scope.privileges)
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedUser) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			UserService.editUser(modifiedUser, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("SETTING.USER") }),
						showCloseButton: true,
					});
					$scope.getAllUsers();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("SETTING.USER") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
	};

	$scope.resetPassword = function (user) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/users/user/reset-password.model.html',
			controller: 'ModalResetPasswordCtrl',
			resolve: {
				params: function () {
					return {
						user: angular.copy(user),
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedUser) {
			let data = {name: modifiedUser.name, password: modifiedUser.password };
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			UserService.resetPassword(data, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("SETTING.USER") }),
						showCloseButton: true,
					});
					$scope.getAllUsers();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("SETTING.USER") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
	};

	$scope.deleteUser = function (user) {
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
				UserService.deleteUser(user, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 204) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("SETTING.USER") }),
							showCloseButton: true,
						});
						$scope.getAllUsers();
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("SETTING.USER") }),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}
		});
	};

	$scope.unlockUser = function (user){
		SweetAlert.swal({
			title: $translate.instant("SWEET.UNLOCK_TITLE"),
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: $translate.instant("SWEET.UNLOCK_CONFIRM_BUTTON_TEXT"),
			cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
			closeOnConfirm: true,
			closeOnCancel: true
		},function (isConfirm) {
			if (isConfirm) {
				let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
				UserService.unlockUser(user, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 200) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_UNLOCK_BODY", { template: $translate.instant("SETTING.USER") }),
							showCloseButton: true,
						});
						$scope.getAllUsers();
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_UNLOCK_BODY", { template: $translate.instant("SETTING.USER") }),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}
		});
	};

	$scope.getAllUsers();
	$scope.getAllPrivileges();

});

app.controller('ModalAddUserCtrl', function ($scope, $uibModalInstance, params) {

	$scope.operation = "USER.ADD_USER";
	$scope.privileges = params.privileges;
	$scope.user = {
		is_admin: false,
		is_read_only: false,
		account_expiration_datetime:moment().add(1,'years'),
        password_expiration_datetime:moment().add(1,'years')
	};
	$scope.dtOptions = {
        locale:{
            format: 'YYYY-MM-DD HH:mm:ss',
            applyLabel: "OK",
            cancelLabel: "Cancel",
        },
		drops: "up",
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 15,
        singleDatePicker: true,
    };
	$scope.ok = function () {
		if ($scope.user.is_admin) {
			$scope.user.privilege_id = undefined;
		}else {
			$scope.user.is_read_only = undefined;
		}
		$scope.user.account_expiration_datetime = $scope.user.account_expiration_datetime.format().slice(0,19);
        $scope.user.password_expiration_datetime = $scope.user.password_expiration_datetime.format().slice(0,19);
		$uibModalInstance.close($scope.user);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditUserCtrl', function ($scope, $uibModalInstance, params) {

	$scope.operation = "USER.EDIT_USER";
	$scope.user = params.user;
	$scope.privileges = params.privileges;
	if ($scope.user.privilege != null) {
		$scope.user.privilege_id = $scope.user.privilege.id;
	} else {
		$scope.user.privilege_id = undefined;
	}
	$scope.dtOptions = {
        locale: {
            format: 'YYYY-MM-DD HH:mm:ss',
            applyLabel: "OK",
            cancelLabel: "Cancel",
        },
		drops: "up",
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 15,
        singleDatePicker: true,
    };
	$scope.ok = function () {
		if ($scope.user.is_admin) {
			$scope.user.privilege_id = undefined;
			if ($scope.user.is_read_only == null) {
				$scope.user.is_read_only = false
			}
		}else {
			$scope.user.is_read_only = undefined;
		}
		$scope.user.account_expiration_datetime = moment($scope.user.account_expiration_datetime).format().slice(0,19);
        $scope.user.password_expiration_datetime = moment($scope.user.password_expiration_datetime).format().slice(0,19);
        $uibModalInstance.close($scope.user);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalResetPasswordCtrl', function ($scope, $uibModalInstance, params) {
	$scope.user = params.user;

	$scope.ok = function () {
		$uibModalInstance.close($scope.user);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalChangePasswordCtrl', function ($scope, $uibModalInstance, params) {
	$scope.user = params.user;

	$scope.ok = function () {
		$uibModalInstance.close($scope.user);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});