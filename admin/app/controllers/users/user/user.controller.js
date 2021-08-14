'use strict';

app.controller('UserController', function ($scope, 
	$window,
	$uibModal, 
	UserService, 
	PrivilegeService, 
	toaster, 
	$translate, 
	SweetAlert) {

	$scope.cur_user = JSON.parse($window.localStorage.getItem("currentUser"));
	$scope.getAllUsers = function () {
		UserService.getAllUsers(function (response) {
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
			UserService.addUser(user, function (response) {
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
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("SETTING.USER") }),
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
			UserService.editUser(modifiedUser, function (response) {
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
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("SETTING.USER") }),
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
			let data = {
				name: modifiedUser.name, 
				password: modifiedUser.password };

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
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("SETTING.USER") }),
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
					UserService.deleteUser(user, function (response) {
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
								title: $translate.instant("TOASTER.FAILURE_TITLE"),
								body: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("SETTING.USER") }),
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
		is_admin: false
	};
	$scope.ok = function () {
		if ($scope.user.is_admin) {
			$scope.user.privilege_id = undefined;
		}
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
	$scope.ok = function () {
		if ($scope.user.is_admin) {
			$scope.user.privilege_id = undefined;
		}
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