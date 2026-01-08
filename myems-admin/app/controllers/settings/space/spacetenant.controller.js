'use strict';

app.controller('SpaceTenantController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    SpaceService,
    TenantService,
    SpaceTenantService, toaster,SweetAlert,
    DragDropWarningService) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.tenants = [];
    $scope.spacetenants = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingTenants = false;
    $scope.tabInitialized = false;
    $scope.isSpaceSelected = false;

    $scope.getAllSpaces = function() {
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceService.getAllSpaces(headers, function (response) {
      if (angular.isDefined(response.status) && response.status === 200) {
        $scope.spaces = response.data;
      } else {
        $scope.spaces = [];
      }
      //create space tree
      var treedata = {'core': {'data': [], "multiple" : false,}, "plugins" : [ "wholerow" ]};
      for(var i=0; i < $scope.spaces.length; i++) {
          if ($scope.spaces[i].id == 1) {
            var node = {"id": $scope.spaces[i].id.toString(),
                                "parent": '#',
                                "text": $scope.spaces[i].name,
                                "state": {  'opened' : true,  'selected' : false },
                               };
          } else {
              var node = {"id": $scope.spaces[i].id.toString(),
                                  "parent": $scope.spaces[i].parent_space.id.toString(),
                                  "text": $scope.spaces[i].name,
                                 };
          };
          treedata['core']['data'].push(node);
      }

      angular.element(spacetreewithtenant).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithtenant).on("changed.jstree", function (e, data) {
          if (data.selected && data.selected.length > 0) {
              $scope.currentSpaceID = parseInt(data.selected[0]);
              $scope.isSpaceSelected = true;
              $scope.getTenantsBySpaceID($scope.currentSpaceID);
          } else {
              $scope.isSpaceSelected = false;
              $scope.spacetenants = [];
          }
          if (!$scope.$$phase && !$scope.$root.$$phase) {
              $scope.$apply();
          }
      });
    });
    };

	$scope.getTenantsBySpaceID = function(id) {
	if ($scope.isLoadingTenants) return;
	$scope.isLoadingTenants = true;
    $scope.spacetenants=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceTenantService.getTenantsBySpaceID(id, headers, function (response) {
                    $scope.isLoadingTenants = false;
      				if (angular.isDefined(response.status) && response.status === 200) {
      					$scope.spacetenants = response.data;
      				} else {
                $scope.spacetenants=[];
              }
    			});
		};

	$scope.getAllTenants = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantService.getAllTenants(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.tenants = response.data;
			} else {
				$scope.tenants = [];
			}
		});
	};

	$scope.pairTenant=function(dragEl,dropEl){
		var tenantid=angular.element('#'+dragEl).scope().tenant.id;
		var spaceid=angular.element(spacetreewithtenant).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceTenantService.addPair(spaceid,tenantid, headers, function (response){
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_TENANT_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getTenantsBySpaceID(spaceid);
				} else {
          toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
          });
				}
		});
	};

	$scope.deleteTenantPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spacetenantid = angular.element('#' + dragEl).scope().spacetenant.id;
        var spaceid = angular.element(spacetreewithtenant).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceTenantService.deletePair(spaceid, spacetenantid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_TENANT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getTenantsBySpaceID(spaceid);
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
		});
	};

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllSpaces();
            $scope.getAllTenants();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { TENANT: 6 };
        if (tabIndex === TAB_INDEXES.TENANT && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { TENANT: 6 };
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.TENANT && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);

    $scope.refreshSpaceTree = function() {
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceService.getAllSpaces(headers, function (response) {
      if (angular.isDefined(response.status) && response.status === 200) {
        $scope.spaces = response.data;
      } else {
        $scope.spaces = [];
      }
      //create space tree
      var treedata = {'core': {'data': [], "multiple" : false,}, "plugins" : [ "wholerow" ]};
      for(var i=0; i < $scope.spaces.length; i++) {
          if ($scope.spaces[i].id == 1) {
            var node = {"id": $scope.spaces[i].id.toString(),
                                "parent": '#',
                                "text": $scope.spaces[i].name,
                                "state": {  'opened' : true,  'selected' : false },
                               };
          } else {
              var node = {"id": $scope.spaces[i].id.toString(),
                                  "parent": $scope.spaces[i].parent_space.id.toString(),
                                  "text": $scope.spaces[i].name,
                                 };
          };
          treedata['core']['data'].push(node);
      }

      angular.element(spacetreewithtenant).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithtenant).jstree(true).refresh();
      // Reset selection state after tree refresh
      $scope.isSpaceSelected = false;
      $scope.spacetenants = [];
      if (!$scope.$$phase && !$scope.$root.$$phase) {
          $scope.$apply();
      }
    });
    };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacetenants = [];
    $scope.refreshSpaceTree();
	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'TENANT',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { TENANT: 6 }
        );

});
