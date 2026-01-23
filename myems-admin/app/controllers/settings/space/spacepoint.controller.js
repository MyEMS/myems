'use strict';

app.controller('SpacePointController', function (
    $scope, 
    $window,
    $timeout,
    $translate, 
    SpaceService,
    DataSourceService, 
    PointService, 
    SpacePointService,  
    toaster, 
    SweetAlert,
    DragDropWarningService) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.spacepoints = [];
    $scope.datasources = [];
    $scope.points = [];
    $scope.filteredPoints = [];
    $scope.isLoadingPoints = false;
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

        angular.element(spacetreewithpoint).jstree(treedata);
        //space tree selected changed event handler
        angular.element(spacetreewithpoint).on("changed.jstree", function (e, data) {
            if (data.selected && data.selected.length > 0) {
                $scope.currentSpaceID = parseInt(data.selected[0]);
                $scope.isSpaceSelected = true;
                $scope.getPointsBySpaceID($scope.currentSpaceID);
            } else {
                $scope.isSpaceSelected = false;
                $scope.spacepoints = [];
            }
            if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
            }
        });
      });
    };

    $scope.getAllDataSources = function () {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        DataSourceService.getAllDataSources(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.datasources = response.data;
                if ($scope.datasources.length > 0) {
                    $scope.currentDataSource = $scope.datasources[0].id;
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.datasources = [];
            }
        });
    };

    // Filter out points that are already bound to the current space,
    // keeping only available points for selection
    $scope.filterAvailablePoints = function() {
        var boundSet = {};
        ($scope.spacepoints || []).forEach(function(sp) {
            if (angular.isDefined(sp.id)) {
                boundSet[String(sp.id)] = true;
            }
        });

        $scope.filteredPoints = ($scope.points || []).filter(function(p){
            return !boundSet[String(p.id)];
        });
    };

    $scope.getPointsByDataSourceID = function (id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        PointService.getPointsByDataSourceID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.points = response.data;
            } else {
                $scope.points = [];
            }
            $scope.filterAvailablePoints();
        });
    };

    $scope.getPointsBySpaceID = function (id) {
        if ($scope.isLoadingPoints) return;
        $scope.isLoadingPoints = true;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpacePointService.getPointsBySpaceID(id, headers, function (response) {
             $scope.isLoadingPoints = false;
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.spacepoints = response.data;
            } else {
                $scope.spacepoints = [];
            }
            $scope.filterAvailablePoints();
        });

    };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var spaceid = $scope.currentSpaceID;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpacePointService.addPair(spaceid, pointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsBySpaceID($scope.currentSpaceID);
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

    $scope.deletePointPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var spacepointid = angular.element('#' + dragEl).scope().spacepoint.id;
        var spaceid = $scope.currentSpaceID;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpacePointService.deletePair(spaceid, spacepointid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getPointsBySpaceID($scope.currentSpaceID);
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
            $scope.getAllDataSources();
            $scope.getAllSpaces();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.POINT) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.isSpaceSelected && $scope.currentSpaceID) {
                $scope.getPointsBySpaceID($scope.currentSpaceID);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.POINT && !$scope.tabInitialized) {
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

        angular.element(spacetreewithpoint).jstree(true).settings.core.data = treedata['core']['data'];
        angular.element(spacetreewithpoint).jstree(true).refresh();
        // Reset selection state after tree refresh
        $scope.isSpaceSelected = false;
        $scope.spacepoints = [];
        if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
        }
      });
    };

  	$scope.$on('handleBroadcastSpaceChanged', function(event) {
        $scope.spacepoints = [];
        $scope.isSpaceSelected = false;
        $scope.currentSpaceID = 1;
        $scope.filterAvailablePoints();
        $scope.refreshSpaceTree();
  	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'POINT',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { POINT: 4 }
        );
});
