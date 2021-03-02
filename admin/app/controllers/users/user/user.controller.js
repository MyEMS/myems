'use strict';

app.controller('UserController', function ($scope, 
	$window,
	$common, 
	$uibModal, 
	UserService, 
	PrivilegeService, 
	toaster, 
	$translate, 
	SweetAlert) {

	$scope.cur_user = JSON.parse($window.localStorage.getItem("currentUser"));
	$scope.getAllUsers = function () {
		UserService.getAllUsers(function (error, data) {
			if (!error) {
				$scope.users = data;
			} else {
				$scope.users = [];
			}
		});

	};

	$scope.getAllPrivileges = function () {
		PrivilegeService.getAllPrivileges(function (error, data) {
			if (!error) {
				$scope.privileges = data;
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
			UserService.addUser(user, function (error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "SETTING.USER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getAllUsers();
				} else {
					var templateName = "SETTING.USER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
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
			UserService.editUser(modifiedUser, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "SETTING.USER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getAllUsers();
				} else {
					var templateName = "SETTING.USER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
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

			UserService.resetPassword(data, headers, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "SETTING.USER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getAllUsers();
				} else {
					var templateName = "SETTING.USER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
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
			function (isConfirm) {
				if (isConfirm) {
					UserService.deleteUser(user, function (error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "SETTING.USER";
							templateName = $translate.instant(templateName);

							var popType = 'TOASTER.SUCCESS';
							var popTitle = $common.toaster.success_title;
							var popBody = $common.toaster.success_delete_body;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody, { template: templateName });

							toaster.pop({
								type: popType,
								title: popTitle,
								body: popBody,
								showCloseButton: true,
							});
							$scope.getAllUsers();
						} else {
							var templateName = "SETTING.USER";
							templateName = $translate.instant(templateName);

							var popType = 'TOASTER.ERROR';
							var popTitle = $common.toaster.error_title;
							var popBody = $common.toaster.error_delete_body;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody, { template: templateName });

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