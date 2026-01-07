'use strict';

app.controller('SpaceDistributionSystemController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    SpaceService,
    DistributionSystemService,
    SpaceDistributionSystemService,
    toaster,SweetAlert,
    DragDropWarningService) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.distributionsystems = [];
    $scope.spacedistributionsystems = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingIstributionsystems = false;
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

      angular.element(spacetreewithdistributionsystem).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithdistributionsystem).on("changed.jstree", function (e, data) {
          if (data.selected && data.selected.length > 0) {
              $scope.currentSpaceID = parseInt(data.selected[0]);
              $scope.isSpaceSelected = true;
              $scope.getDistributionSystemsBySpaceID($scope.currentSpaceID);
          } else {
              $scope.isSpaceSelected = false;
              $scope.spacedistributionsystems = [];
          }
          if (!$scope.$$phase && !$scope.$root.$$phase) {
              $scope.$apply();
          }
      });
    });
    };

	$scope.getDistributionSystemsBySpaceID = function(id) {
	if ($scope.isLoadingIstributionsystems) return;
	$scope.isLoadingIstributionsystems = true;
    $scope.spacedistributionsystems=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceDistributionSystemService.getDistributionSystemsBySpaceID(id, headers, function (response) {
            $scope.isLoadingIstributionsystems = false;
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.spacedistributionsystems = response.data;
            } else {
              $scope.spacedistributionsystems=[];
            }
        });
		};

	$scope.getAllDistributionSystems = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		DistributionSystemService.getAllDistributionSystems(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.distributionsystems = response.data;
			} else {
				$scope.distributionsystems = [];
			}
		});
	};

	$scope.pairDistributionSystem=function(dragEl,dropEl){
		var distributionsystemid=angular.element('#'+dragEl).scope().distributionsystem.id;
		var spaceid=angular.element(spacetreewithdistributionsystem).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceDistributionSystemService.addPair(spaceid,distributionsystemid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_DISTRIBUTIONSYSTEM_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getDistributionSystemsBySpaceID(spaceid);
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

	$scope.deleteDistributionSystemPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spacedistributionsystemid = angular.element('#' + dragEl).scope().spacedistributionsystem.id;
        var spaceid = angular.element(spacetreewithdistributionsystem).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceDistributionSystemService.deletePair(spaceid, spacedistributionsystemid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_DISTRIBUTIONSYSTEM_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getDistributionSystemsBySpaceID(spaceid);
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
            $scope.getAllDistributionSystems();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { DISTRIBUTION_SYSTEM: 13 };
        if (tabIndex === TAB_INDEXES.DISTRIBUTION_SYSTEM && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { DISTRIBUTION_SYSTEM: 13 };
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.DISTRIBUTION_SYSTEM && !$scope.tabInitialized) {
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

      angular.element(spacetreewithdistributionsystem).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithdistributionsystem).jstree(true).refresh();
      // Reset selection state after tree refresh
      $scope.isSpaceSelected = false;
      $scope.spacedistributionsystems = [];
      if (!$scope.$$phase && !$scope.$root.$$phase) {
          $scope.$apply();
      }
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacedistributionsystems = [];
    $scope.refreshSpaceTree();
	});

    // Listen for disabled drop events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DROP-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'DISTRIBUTION_SYSTEM',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { DISTRIBUTION_SYSTEM: 13 }
        );
    });

    // Listen for disabled drag events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'DISTRIBUTION_SYSTEM',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { DISTRIBUTION_SYSTEM: 13 }
        );
    });
});
