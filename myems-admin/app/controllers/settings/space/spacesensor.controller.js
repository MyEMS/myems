'use strict';

app.controller('SpaceSensorController', function (
    $scope,
    $window,
    $translate,
    SpaceService,
    SensorService,
    SpaceSensorService,  toaster, SweetAlert) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.sensors = [];
    $scope.spacesensors = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

    $scope.getAllSensors = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorService.getAllSensors(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensors = response.data;
            } else {
                $scope.sensors = [];
            }
        });
    };

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

        angular.element(spacetreewithsensor).jstree(treedata);
        //space tree selected changed event handler
        angular.element(spacetreewithsensor).on("changed.jstree", function (e, data) {
            $scope.currentSpaceID = parseInt(data.selected[0]);
            $scope.getSensorsBySpaceID($scope.currentSpaceID);
        });
      });
    };

    $scope.getSensorsBySpaceID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceSensorService.getSensorsBySpaceID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.spacesensors = response.data;
            } else {
                $scope.spacesensors = [];
            }
        });
    };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var spaceid = $scope.currentSpaceID;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceSensorService.addPair(spaceid, sensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsBySpaceID($scope.currentSpaceID);
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

    $scope.deleteSensorPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var spacesensorid = angular.element('#' + dragEl).scope().spacesensor.id;
        var spaceid = $scope.currentSpaceID;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceSensorService.deletePair(spaceid, spacesensorid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsBySpaceID($scope.currentSpaceID);
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

    $scope.getAllSensors();
    $scope.getAllSpaces();

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

        angular.element(spacetreewithsensor).jstree(true).settings.core.data = treedata['core']['data'];
        angular.element(spacetreewithsensor).jstree(true).refresh();
      });
    };

  	$scope.$on('handleBroadcastSpaceChanged', function(event) {
      $scope.spacesensors = [];
      $scope.refreshSpaceTree();
  	});
});
