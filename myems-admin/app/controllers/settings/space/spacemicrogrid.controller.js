'use strict';

app.controller('SpaceMicrogridController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    SpaceService,
    MicrogridService,
    SpaceMicrogridService,
    toaster, SweetAlert,
    DragDropWarningService) {
    
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.microgrids = [];
    $scope.spacemicrogrids = [];
    $scope.filteredMicrogrids = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingMicrogrids = false;
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

            var treedata = {'core': {'data': [], "multiple" : false }, "plugins" : [ "wholerow" ]};
            for (var i = 0; i < $scope.spaces.length; i++) {
                var node = {
                    "id": $scope.spaces[i].id.toString(),
                    "parent": $scope.spaces[i].id == 1 ? '#' : $scope.spaces[i].parent_space.id.toString(),
                    "text": $scope.spaces[i].name,
                    "state": $scope.spaces[i].id == 1 ? { 'opened': true, 'selected': false } : undefined
                };
                treedata['core']['data'].push(node);
            }

            angular.element(spacetreewithmicrogrid).jstree(treedata);

            angular.element(spacetreewithmicrogrid).on("changed.jstree", function (e, data) {
                if (data.selected && data.selected.length > 0) {
                    $scope.currentSpaceID = parseInt(data.selected[0]);
                    $scope.isSpaceSelected = true;
                    $scope.getMicrogridsBySpaceID($scope.currentSpaceID);
                } else {
                    $scope.isSpaceSelected = false;
                    $scope.spacemicrogrids = [];
                }
                if (!$scope.$$phase && !$scope.$root.$$phase) {
                    $scope.$apply();
                }
            });
        });
    };

    $scope.getMicrogridsBySpaceID = function(id) {
        if($scope.isLoadingMicrogrids) return;
        $scope.isLoadingMicrogrids = true;
        $scope.spacemicrogrids = [];
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceMicrogridService.getMicrogridsBySpaceID(id, headers, function (response) {
            $scope.isLoadingMicrogrids = false;
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.spacemicrogrids = response.data;
            } else {
                $scope.spacemicrogrids = [];
            }
            $scope.filterAvailableMicrogrids();
        });
    };

    // Filter out microgrids already bound to the current space, keeping only available ones for selection
    $scope.filterAvailableMicrogrids = function() {
        var boundSet = {};
        ($scope.spacemicrogrids || []).forEach(function(sm) {
            if (angular.isDefined(sm.id)) {
                boundSet[String(sm.id)] = true;
            }
        });

        $scope.filteredMicrogrids = ($scope.microgrids || []).filter(function(m){
            return !boundSet[String(m.id)];
        });
    };

    $scope.getAllMicrogrids = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridService.getAllMicrogrids(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.microgrids = response.data;
            } else {
                $scope.microgrids = [];
            }
            $scope.filterAvailableMicrogrids();
        });
    };

    $scope.pairMicrogrid = function(dragEl, dropEl) {
        var microgridid = angular.element('#' + dragEl).scope().microgrid.id;
        var spaceid = angular.element(spacetreewithmicrogrid).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceMicrogridService.addPair(spaceid, microgridid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_MICROGRID_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMicrogridsBySpaceID(spaceid);
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

    $scope.deleteMicrogridPair = function(dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var spacemicrogridid = angular.element('#' + dragEl).scope().spacemicrogrid.id;
        var spaceid = angular.element(spacetreewithmicrogrid).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceMicrogridService.deletePair(spaceid, spacemicrogridid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_MICROGRID_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMicrogridsBySpaceID(spaceid);
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

    $scope.refreshSpaceTree = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceService.getAllSpaces(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.spaces = response.data;
            } else {
                $scope.spaces = [];
            }

            var treedata = {'core': {'data': [], "multiple" : false }, "plugins" : [ "wholerow" ]};
            for (var i = 0; i < $scope.spaces.length; i++) {
                var node = {
                    "id": $scope.spaces[i].id.toString(),
                    "parent": $scope.spaces[i].id == 1 ? '#' : $scope.spaces[i].parent_space.id.toString(),
                    "text": $scope.spaces[i].name,
                    "state": $scope.spaces[i].id == 1 ? { 'opened': true, 'selected': false } : undefined
                };
                treedata['core']['data'].push(node);
            }

            angular.element(spacetreewithmicrogrid).jstree(true).settings.core.data = treedata['core']['data'];
            angular.element(spacetreewithmicrogrid).jstree(true).refresh();
            // Reset selection state after tree refresh
            $scope.isSpaceSelected = false;
            $scope.spacemicrogrids = [];
            if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
            }
        });
    };

    $scope.$on('handleBroadcastSpaceChanged', function(event) {
        $scope.spacemicrogrids = [];
        $scope.isSpaceSelected = false;
        $scope.currentSpaceID = 1;
        $scope.filterAvailableMicrogrids();
        $scope.refreshSpaceTree();
    });

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'MICROGRID',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { MICROGRID: 15 }
        );

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllSpaces();
            $scope.getAllMicrogrids();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.MICROGRID) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.isSpaceSelected && $scope.currentSpaceID) {
                $scope.getMicrogridsBySpaceID($scope.currentSpaceID);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.MICROGRID && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);
});