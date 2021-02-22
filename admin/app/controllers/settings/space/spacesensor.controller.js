'use strict';

app.controller('SpaceSensorController', function ($scope, $common, $uibModal, $timeout, $translate, SpaceService, SensorService, SpaceSensorService,  toaster, SweetAlert) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.sensors = [];
    $scope.spacesensors = [];

    $scope.getAllSensors = function () {
      SensorService.getAllSensors(function (error, data) {
          if (!error) {
              $scope.sensors = data;
          } else {
              $scope.sensors = [];
          }
      });
    };

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

        angular.element(spacetreewithsensor).jstree(treedata);
        //space tree selected changed event handler
        angular.element(spacetreewithsensor).on("changed.jstree", function (e, data) {
            $scope.currentSpaceID = parseInt(data.selected[0]);
            $scope.getSensorsBySpaceID($scope.currentSpaceID);
        });
      });
    };

    $scope.getSensorsBySpaceID = function (id) {
        SpaceSensorService.getSensorsBySpaceID(id, function (error, data) {
            if (!error) {
                $scope.spacesensors = data;
            } else {
                $scope.spacesensors = [];
            }
        });
    };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var spaceid = $scope.currentSpaceID;
        SpaceSensorService.addPair(spaceid, sensorid, function (error, status) {
            if (angular.isDefined(status) && status == 201) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.BIND_SENSOR_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getSensorsBySpaceID($scope.currentSpaceID);
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

    $scope.deleteSensorPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var spacesensorid = angular.element('#' + dragEl).scope().spacesensor.id;
        var spaceid = $scope.currentSpaceID;
        SpaceSensorService.deletePair(spaceid, spacesensorid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.UNBIND_SENSOR_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getSensorsBySpaceID($scope.currentSpaceID);
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

    $scope.getAllSensors();
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

        angular.element(spacetreewithsensor).jstree(true).settings.core.data = treedata['core']['data'];
        angular.element(spacetreewithsensor).jstree(true).refresh();
      });
    };

  	$scope.$on('handleBroadcastSpaceChanged', function(event) {
      $scope.spacesensors = [];
      $scope.refreshSpaceTree();
  	});
});
