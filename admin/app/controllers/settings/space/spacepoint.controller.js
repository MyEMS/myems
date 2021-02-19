'use strict';

app.controller('SpacePointController', function ($scope, $common, $uibModal, $timeout, $translate, SpaceService, DataSourceService, PointService, SpacePointService,  toaster, SweetAlert) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.spacepoints = [];
    $scope.datasources = [];
    $scope.points = [];

    $scope.getAllSpaces = function() {
      SpaceService.getAllSpaces(function(error, data) {
        if (!error) {
          $scope.spaces = data;
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
            $scope.currentSpaceID = parseInt(data.selected[0]);
            $scope.getPointsBySpaceID($scope.currentSpaceID);
        });
      });
    };

    $scope.getAllDataSources = function () {
        DataSourceService.getAllDataSources(function (error, data) {
            if (!error) {
                $scope.datasources = data;
                if ($scope.datasources.length > 0) {
                    $scope.currentDataSource = $scope.datasources[0].id;
                    $scope.getPointsByDataSourceID($scope.currentDataSource);
                }
            } else {
                $scope.datasources = [];
            }
        });
    };

    $scope.getPointsByDataSourceID = function (id) {
        PointService.getPointsByDataSourceID(id, function (error, data) {
            if (!error) {
                $scope.points = data;
            } else {
                $scope.points = [];
            }
        });
    };

    $scope.getPointsBySpaceID = function (id) {
        SpacePointService.getPointsBySpaceID(id, function (error, data) {
            if (!error) {
                $scope.spacepoints = data;
            } else {
                $scope.spacepoints = [];
            }
        });

    };

    $scope.changeDataSource = function (item, model) {
        $scope.currentDataSource = model;
        $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.pairPoint = function (dragEl, dropEl) {
        var pointid = angular.element('#' + dragEl).scope().point.id;
        var spaceid = $scope.currentSpaceID;
        SpacePointService.addPair(spaceid, pointid, function (error, status) {
            if (angular.isDefined(status) && status == 201) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.BIND_POINT_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getPointsBySpaceID($scope.currentSpaceID);
            } else {
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
            }
        });
    };

    $scope.deletePointPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var spacepointid = angular.element('#' + dragEl).scope().spacepoint.id;
        var spaceid = $scope.currentSpaceID;
        SpacePointService.deletePair(spaceid, spacepointid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.UNBIND_POINT_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getPointsBySpaceID($scope.currentSpaceID);
            } else {
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
            }
        });
    };

    $scope.getAllDataSources();
    $scope.getAllSpaces();

    $scope.refreshSpaceTree = function() {
      SpaceService.getAllSpaces(function(error, data) {
        if (!error) {
          $scope.spaces = data;
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
      });
    };

  	$scope.$on('handleBroadcastSpaceChanged', function(event) {
      $scope.spacepoints = [];
      $scope.refreshSpaceTree();
  	});
});
