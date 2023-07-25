'use strict';

app.controller('PrivilegeController', function (
    $scope,
    $rootScope,
	$window,
	$uibModal,
	PrivilegeService,
	toaster,
	$translate,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllPrivileges = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		PrivilegeService.getAllPrivileges(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.privileges = response.data;
			} else {
				$scope.privileges = [];
			}
		});

	};

	$scope.addPrivilege = function () {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/users/privilege/privilege.model.html',
			controller: 'ModalAddPrivilegeCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function () {
					return {
						spacetree: angular.copy($scope.spacetree),
					};
				}
			}
		});
		modalInstance.result.then(function (privilege) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			PrivilegeService.addPrivilege(privilege, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("USER.PRIVILEGE") }),
						showCloseButton: true,
					});
					$scope.getAllPrivileges();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("USER.PRIVILEGE") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editPrivilege = function (privilege) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/users/privilege/privilege.model.html',
			controller: 'ModalEditPrivilegeCtrl',
			resolve: {
				params: function () {
					return {
						spacetree: angular.copy($scope.spacetree),
						privilege: angular.copy(privilege)
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedPrivilege) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			PrivilegeService.editPrivilege(modifiedPrivilege, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("USER.PRIVILEGE") }),
						showCloseButton: true,
					});
					$scope.getAllPrivileges();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("USER.PRIVILEGE") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.deletePrivilege = function (privilege) {
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
				PrivilegeService.deletePrivilege(privilege, headers, function (response) {
					if (angular.isDefined(response.status) && response.status === 204) {
						toaster.pop({
							type: "success",
							title: $translate.instant("TOASTER.SUCCESS_TITLE"),
							body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("USER.PRIVILEGE") }),
							showCloseButton: true,
						});
						$scope.getAllPrivileges();
					} else {
						toaster.pop({
							type: "error",
							title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("USER.PRIVILEGE") }),
							body: $translate.instant(response.data.description),
							showCloseButton: true,
						});
					}
				});
			}
		});
	};

	$scope.getAllPrivileges();

});

app.controller('ModalAddPrivilegeCtrl', function ($scope,
	$window,
	$uibModalInstance,
	SpaceService,
	$timeout,
	params) {

	$scope.operation = "USER.ADD_PRIVILEGE";
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.spaces = [];
	$scope.currentSpaceID = 1;
	$scope.privilege = {};

	$scope.getAllSpaces = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceService.getAllSpaces(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.spaces = response.data;
			} else {
				$scope.spaces = [];
			}
			//create space tree
			var treedata = { 'core': { 'data': [], "multiple": false, }, "plugins": ["wholerow"] };
			for (var i = 0; i < $scope.spaces.length; i++) {
				if ($scope.spaces[i].id == 1) {
					var node = {
						"id": $scope.spaces[i].id.toString(),
						"parent": '#',
						"text": $scope.spaces[i].name,
						"state": { 'opened': true, 'selected': true },
					};
				} else {
					var node = {
						"id": $scope.spaces[i].id.toString(),
						"parent": $scope.spaces[i].parent_space.id.toString(),
						"text": $scope.spaces[i].name,
					};
				};
				treedata['core']['data'].push(node);
			}

			angular.element(spacetree).jstree(treedata);
			//space tree selected changed event handler
			angular.element(spacetree).on("changed.jstree", function (e, data) {
				$scope.currentSpaceID = parseInt(data.selected[0]);
			});
		});
	};

	$scope.ok = function () {
		$scope.privilege.data = JSON.stringify({"spaces": [$scope.currentSpaceID, ]});
		$uibModalInstance.close($scope.privilege);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
	$scope.getAllSpaces();
});

app.controller('ModalEditPrivilegeCtrl', function ($scope,
	$window,
	$uibModalInstance,
	SpaceService,
	$timeout,
	params) {
	$scope.operation = "USER.EDIT_PRIVILEGE";
	$scope.privilege = params.privilege;
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.spaces = [];
	var privilege_data = JSON.parse(params.privilege.data);
	$scope.currentSpaceID = privilege_data['spaces'][0];

	$scope.getAllSpaces = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceService.getAllSpaces(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.spaces = response.data;
			} else {
				$scope.spaces = [];
			}
			//create space tree
			var treedata = { 'core': { 'data': [], "multiple": false, }, "plugins": ["wholerow"] };
			for (var i = 0; i < $scope.spaces.length; i++) {
				if ($scope.spaces[i].id == $scope.currentSpaceID) {
					var node = {
						"id": $scope.spaces[i].id.toString(),
						"parent": ($scope.spaces[i].id == 1)? '#': $scope.spaces[i].parent_space.id.toString(),
						"text": $scope.spaces[i].name,
						"state": { 'opened': true, 'selected': true },
					};
				} else {
					var node = {
						"id": $scope.spaces[i].id.toString(),
						"parent": ($scope.spaces[i].id == 1)? '#': $scope.spaces[i].parent_space.id.toString(),
						"text": $scope.spaces[i].name,
					};
				};
				treedata['core']['data'].push(node);
			}

			angular.element(spacetree).jstree(treedata);
			//space tree selected changed event handler
			angular.element(spacetree).on("changed.jstree", function (e, data) {
				$scope.currentSpaceID = parseInt(data.selected[0]);
			});
		});
	};

	$scope.ok = function () {
		$scope.privilege.data = JSON.stringify({"spaces": [$scope.currentSpaceID, ]});
		$uibModalInstance.close($scope.privilege);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.getAllSpaces();
});
