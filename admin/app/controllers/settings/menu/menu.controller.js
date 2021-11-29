'use strict';

app.controller('MenuController', function ($scope, $window, $uibModal, MenuService, toaster, $translate) {
	$scope.menus = [];
	$scope.currentMenu = {};
	$scope.currentMenuChildren = [];
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.getAllMenus = function () {
		MenuService.getAllMenus(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.menus = response.data;
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
				if (data.action === 'ready' || data.action === 'select_node') {
					$scope.getMenuChildren(parseInt(data.selected[0]));
				};
			});
		});
	};

	$scope.refreshMenuTree = function () {
		MenuService.getAllMenus(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.menus = response.data;
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
		MenuService.getMenuChildren(menuid, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.currentMenu = response.data["current"];
				$scope.currentMenuChildren = response.data["children"];
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
					};
				}
			}
		});

		modalInstance.result.then(function (modifiedMenu) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			MenuService.editMenu(modifiedMenu, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("COMMON.MENU") }),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitMenuChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("COMMON.MENU") }),
						body: $translate.instant(response.data.description),
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
