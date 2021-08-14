'use strict';

app.controller('SpaceController', function ($scope, $uibModal, SpaceService, CostCenterService, ContactService, toaster, $translate, SweetAlert) {
	$scope.spaces = [];
	$scope.currentSpaceID = 1;
	$scope.currentSpace = {};
	$scope.currentSpaceChildren = [];

	$scope.getAllCostCenters = function () {
		CostCenterService.getAllCostCenters(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.costcenters = response.data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function () {
		ContactService.getAllContacts(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.contacts = response.data;
			} else {
				$scope.contacts = [];
			}
		});
	};

	$scope.getAllSpaces = function () {
		SpaceService.getAllSpaces(function (response) {
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
				$scope.getSpaceChildren($scope.currentSpaceID);
			});
		});
	};

	$scope.refreshSpaceTree = function () {
		SpaceService.getAllSpaces(function (response) {
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
		SpaceService.getSpaceChildren(spaceid, function (response) {
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
		SpaceService.getAllTimezones(function (response) {
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
			SpaceService.addSpace(space, function (response) {
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
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.SPACE") }),
						showCloseButton: true,
					});
				}
			});
		}, function () {

		});
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
			SpaceService.editSpace(modifiedSpace, function (response) {
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
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("COMMON.SPACE") }),
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
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
					SpaceService.deleteSpace(space, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("COMMON.SPACE") }),
								showCloseButton: true,
							});
							$scope.$emit('handleEmitSpaceChanged');
						} else if (angular.isDefined(response.status) && response.status === 400) {
							toaster.pop({
								type: "success",
								title: $translate.instant(response.data.title),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.FAILURE_TITLE"),
								body: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("COMMON.SPACE") }),
								showCloseButton: true,
							});
						}
					});
				}
			});
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
