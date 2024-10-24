'use strict';

app.controller('SpaceController', function (
	$scope,
	$rootScope,
	$window,
	$uibModal,
	SpaceService,
	CostCenterService,
	ContactService,
	toaster,
	$translate,
	SweetAlert) {
	$scope.spaces = [];
	$scope.currentSpaceID = 1;
	$scope.currentSpace = {};
	$scope.currentSpaceChildren = [];
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.getAllCostCenters = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CostCenterService.getAllCostCenters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		ContactService.getAllContacts(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
			} else {
				$scope.contacts = [];
			}
		});
	};

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
				if (data.action === 'ready' || data.action === 'select_node') {
					$scope.currentSpaceID = parseInt(data.selected[0]);
					$scope.getSpaceChildren($scope.currentSpaceID);
				}
			});
		});
	};

	$scope.refreshSpaceTree = function () {
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
			var spacetree = document.getElementById("spacetree");
			angular.element(spacetree).jstree(true).settings.core.data = treedata['core']['data'];
			angular.element(spacetree).jstree(true).refresh();
		});
	};

	$scope.getSpaceChildren = function (spaceid) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceService.getSpaceChildren(spaceid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.currentSpace = response.data["current"];
				$scope.currentSpaceChildren = response.data["children"];
			} else {
				$scope.currentSpace = {};
				$scope.currentSpaceChildren = [];
			}
		});
	};

	$scope.getAllTimezones = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceService.getAllTimezones(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.timezones = response.data;
			} else {
				$scope.timezones = [];
			}
		});
	};

	$scope.addSpace = function () {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/space/space.model.html',
			controller: 'ModalAddSpaceCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function () {
					return {
						parent_space_id: angular.copy($scope.currentSpaceID),
						timezones: angular.copy($scope.timezones),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts)
					};
				}
			}
		});

		modalInstance.result.then(function (space) {
			space.timezone_id = space.timezone.id;
			space.cost_center_id = space.cost_center.id;
			if (space.contact != null) {
				space.contact_id = space.contact.id;
			}
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			SpaceService.addSpace(space, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", { template: $translate.instant("COMMON.SPACE") }),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitSpaceChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.SPACE") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editSpace = function (space) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/space/space.model.html',
			controller: 'ModalEditSpaceCtrl',
			resolve: {
				params: function () {
					return {
						space: angular.copy(space),
						spaces: angular.copy($scope.spaces),
						timezones: angular.copy($scope.timezones),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedSpace) {
			if (modifiedSpace.parent_space != null) {
				modifiedSpace.parent_space_id = modifiedSpace.parent_space.id;
			} else {
				modifiedSpace.parent_space_id = null;
			}
			modifiedSpace.timezone_id = modifiedSpace.timezone.id;
			if (modifiedSpace.contact != null) {
				modifiedSpace.contact_id = modifiedSpace.contact.id;
			}

			modifiedSpace.cost_center_id = modifiedSpace.cost_center.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			SpaceService.editSpace(modifiedSpace, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("COMMON.SPACE") }),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitSpaceChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("COMMON.SPACE") }),
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

	$scope.deleteSpace = function (space) {
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
					SpaceService.deleteSpace(space, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("COMMON.SPACE") }),
								showCloseButton: true,
							});
							$scope.$emit('handleEmitSpaceChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("COMMON.SPACE") }),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.exportSpace = function(space) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceService.exportSpace(space, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.exportdata = JSON.stringify(response.data);
				var modalInstance = $uibModal.open({
					windowClass: "animated fadeIn",
					templateUrl: 'views/common/export.html',
					controller: 'ModalExportCtrl',
					resolve: {
						params: function() {
							return {
								exportdata: angular.copy($scope.exportdata)
							};
						}
					}
				});
				modalInstance.result.then(function() {
					//do nothing;
				}, function() {
					//do nothing;
				});
				$rootScope.modalInstance = modalInstance;
			} else {
				$scope.exportdata = null;
			}
		});
	};

	$scope.cloneSpace = function(space){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceService.cloneSpace(space, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SPACE")}),
					showCloseButton: true,
				});
				$scope.$emit('handleEmitSpaceChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.SPACE")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importSpace = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/common/import.html',
			controller: 'ModalImportCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
					};
				}
			}
		});
		modalInstance.result.then(function(importdata) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			SpaceService.importSpace(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SPACE")}),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitSpaceChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.SPACE") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllSpaces();
	$scope.getAllTimezones();
	$scope.getAllCostCenters();
	$scope.getAllContacts();

	$scope.$on('handleBroadcastSpaceChanged', function (event) {
		$scope.refreshSpaceTree();
	});

});

app.controller('ModalAddSpaceCtrl', function ($scope, $uibModalInstance, params) {

	$scope.operation = "SETTING.ADD_SPACE";
	$scope.timezones = params.timezones;
	$scope.costcenters = params.costcenters;
	$scope.contacts = params.contacts;
	$scope.space = {
		parent_space_id: params.parent_space_id,
		is_input_counted: false,
		is_output_counted: false,
	};
	$scope.ok = function () {
		$uibModalInstance.close($scope.space);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditSpaceCtrl', function ($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_SPACE";
	$scope.space = params.space;
	$scope.timezones = params.timezones;
	$scope.costcenters = params.costcenters;
	$scope.contacts = params.contacts;

	$scope.ok = function () {
		$uibModalInstance.close($scope.space);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
