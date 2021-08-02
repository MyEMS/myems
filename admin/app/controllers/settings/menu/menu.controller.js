'use strict';

app.controller('MenuController', function ($scope, $common, $uibModal, MenuService, CostCenterService, ContactService, toaster, $translate, SweetAlert) {
	$scope.menus = [];
	$scope.currentMenuID = null;
	$scope.currentMenu = {};
	$scope.currentMenuChildren = [];

	$scope.getAllMenus = function () {
		MenuService.getAllMenus(function (error, data) {
			if (!error) {
				$scope.menus = data;
			} else {
				$scope.menus = [];
			}
			//create menu tree
			var treedata = { 'core': { 'data': [], "multiple": false, }, "plugins": ["wholerow"] };
			for (var i = 0; i < $scope.menus.length; i++) {
				if ($scope.menus[i].parent_menu_id == null) {
					var node = {
						"id": $scope.menus[i].id.toString(),
						"parent": '#',
						"text": $scope.menus[i].name,
						"state": { 'opened': true },
					};
				} else {
					var node = {
						"id": $scope.menus[i].id.toString(),
						"parent": $scope.menus[i].parent_menu_id.toString(),
						"text": $scope.menus[i].name,
						"state": { 'opened': true },
					};
				};
				treedata['core']['data'].push(node);
			}

			angular.element(menutree).jstree(treedata);
			//menu tree selected changed event handler
			angular.element(menutree).on("changed.jstree", function (e, data) {
				$scope.currentMenuID = parseInt(data.selected[0]);
				$scope.getMenuChildren($scope.currentMenuID);
			});
		});
	};

	$scope.refreshMenuTree = function () {
		MenuService.getAllMenus(function (error, data) {
			if (!error) {
				$scope.menus = data;
			} else {
				$scope.menus = [];
			}
			//create menu tree
			var treedata = { 'core': { 'data': [], "multiple": false, }, "plugins": ["wholerow"] };
			for (var i = 0; i < $scope.menus.length; i++) {
				if ($scope.menus[i].parent_menu_id == null) {
					var node = {
						"id": $scope.menus[i].id.toString(),
						"parent": '#',
						"text": $scope.menus[i].name,
						"state": { 'opened': true},
					};
				} else {
					var node = {
						"id": $scope.menus[i].id.toString(),
						"parent": $scope.menus[i].parent_menu_id.toString(),
						"text": $scope.menus[i].name,
						"state": { 'opened': true},
					};
				};
				treedata['core']['data'].push(node);
			}
			var menutree = document.getElementById("menutree");
			angular.element(menutree).jstree(true).settings.core.data = treedata['core']['data'];
			angular.element(menutree).jstree(true).refresh();
		});
	};

	$scope.getMenuChildren = function (menuid) {
		MenuService.getMenuChildren(menuid, function (error, data) {
			if (!error) {
				$scope.currentMenu = data["current"];
				$scope.currentMenuChildren = data["children"];
			} else {
				$scope.currentMenu = {};
				$scope.currentMenuChildren = [];
			}
		});
	};
	
	$scope.editMenu = function (menu) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/menu/menu.model.html',
			controller: 'ModalEditMenuCtrl',
			resolve: {
				params: function () {
					return {
						menu: angular.copy(menu),
						menus: angular.copy($scope.menus),
						timezones: angular.copy($scope.timezones),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedMenu) {
			if (modifiedMenu.parent_menu != null) {
				modifiedMenu.parent_menu_id = modifiedMenu.parent_menu_id;
			} else {
				modifiedMenu.parent_menu_id = null;
			}
			
			MenuService.editMenu(modifiedMenu, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMMON.MENU";
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
					$scope.$emit('handleEmitMenuChanged');
				} else {
					var templateName = "COMMON.MENU";
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

	$scope.getAllMenus();

	$scope.$on('handleBroadcastMenuChanged', function (event) {
		$scope.refreshMenuTree();
	});

});


app.controller('ModalEditMenuCtrl', function ($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_MENU";
	$scope.menu = params.menu;

	$scope.ok = function () {
		$uibModalInstance.close($scope.menu);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
