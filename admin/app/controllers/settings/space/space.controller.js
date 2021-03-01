'use strict';

app.controller('SpaceController', function ($scope, $common, $uibModal, SpaceService, CostCenterService, ContactService, toaster, $translate, SweetAlert) {
	$scope.spaces = [];
	$scope.currentSpaceID = 1;
	$scope.currentSpace = {};
	$scope.currentSpaceChildren = [];

	$scope.getAllCostCenters = function () {
		CostCenterService.getAllCostCenters(function (error, data) {
			if (!error) {
				$scope.costcenters = data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function () {
		ContactService.getAllContacts(function (error, data) {
			if (!error) {
				$scope.contacts = data;
			} else {
				$scope.contacts = [];
			}
		});
	};

	$scope.getAllSpaces = function () {
		SpaceService.getAllSpaces(function (error, data) {
			if (!error) {
				$scope.spaces = data;
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
		SpaceService.getAllSpaces(function (error, data) {
			if (!error) {
				$scope.spaces = data;
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
		SpaceService.getSpaceChildren(spaceid, function (error, data) {
			if (!error) {
				$scope.currentSpace = data["current"];
				$scope.currentSpaceChildren = data["children"];
			} else {
				$scope.currentSpace = {};
				$scope.currentSpaceChildren = [];
			}
		});
	};

	$scope.getAllTimezones = function () {
		SpaceService.getAllTimezones(function (error, data) {
			if (!error) {
				$scope.timezones = data;
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
			space.contact_id = space.contact.id;
			SpaceService.addSpace(space, function (error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "COMMON.SPACE";
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
					$scope.$emit('handleEmitSpaceChanged');
				} else {
					var templateName = "COMMON.SPACE";
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
			SpaceService.editSpace(modifiedSpace, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMMON.SPACE";
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
					$scope.$emit('handleEmitSpaceChanged');
				} else {
					var templateName = "COMMON.SPACE";
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

	$scope.deleteSpace = function (space) {
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
					SpaceService.deleteSpace(space, function (error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "COMMON.SPACE";
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
							$scope.$emit('handleEmitSpaceChanged');
						} else if (angular.isDefined(status) && status == 400) {
							var popType = 'TOASTER.ERROR';
							var popTitle = error.title;
							var popBody = error.description;

							popType = $translate.instant(popType);
							popTitle = $translate.instant(popTitle);
							popBody = $translate.instant(popBody);

							toaster.pop({
								type: popType,
								title: popTitle,
								body: popBody,
								showCloseButton: true,
							});
						} else {
							var templateName = "COMMON.SPACE";
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
