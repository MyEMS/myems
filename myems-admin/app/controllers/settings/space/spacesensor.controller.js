'use strict';

app.controller('SpaceSensorController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    SpaceService,
    SensorService,
    SpaceSensorService,  toaster, SweetAlert,
    DragDropWarningService) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.sensors = [];
    $scope.spacesensors = [];
    $scope.filteredSensors = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingSensors = false;
    $scope.tabInitialized = false;
    $scope.isSpaceSelected = false;

    // Filter out sensors that are already bound to the current space,
    // keeping only available sensors for selection
    $scope.filterAvailableSensors = function() {
        var boundSet = {};
        ($scope.spacesensors || []).forEach(function(ss) {
            if (angular.isDefined(ss.id)) {
                boundSet[String(ss.id)] = true;
            }
        });

        $scope.filteredSensors = ($scope.sensors || []).filter(function(s){
            return !boundSet[String(s.id)];
        });
    };

    $scope.getAllSensors = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorService.getAllSensors(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.sensors = response.data;
            } else {
                $scope.sensors = [];
            }
            $scope.filterAvailableSensors();
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
            if (data.selected && data.selected.length > 0) {
                $scope.currentSpaceID = parseInt(data.selected[0]);
                $scope.isSpaceSelected = true;
                $scope.getSensorsBySpaceID($scope.currentSpaceID);
            } else {
                $scope.isSpaceSelected = false;
                $scope.spacesensors = [];
            }
            if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
            }
        });
      });
    };

    $scope.getSensorsBySpaceID = function (id) {
        if ($scope.isLoadingSensors) return;
        $scope.isLoadingSensors = true;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceSensorService.getSensorsBySpaceID(id, headers, function (response) {
            $scope.isLoadingSensors = false;
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.spacesensors = response.data;
            } else {
                $scope.spacesensors = [];
            }
            $scope.filterAvailableSensors();
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

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllSensors();
            $scope.getAllSpaces();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.SENSOR) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.isSpaceSelected && $scope.currentSpaceID) {
                $scope.getSensorsBySpaceID($scope.currentSpaceID);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.SENSOR && !$scope.tabInitialized) {
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

        angular.element(spacetreewithsensor).jstree(true).settings.core.data = treedata['core']['data'];
        angular.element(spacetreewithsensor).jstree(true).refresh();
        // Reset selection state after tree refresh
        $scope.isSpaceSelected = false;
        $scope.spacesensors = [];
        if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
        }
      });
    };

  	$scope.$on('handleBroadcastSpaceChanged', function(event) {
        $scope.spacesensors = [];
        $scope.isSpaceSelected = false;
        $scope.currentSpaceID = 1;
        $scope.filterAvailableSensors();
        $scope.refreshSpaceTree();
  	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'SENSOR',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { SENSOR: 5 }
        );
});
