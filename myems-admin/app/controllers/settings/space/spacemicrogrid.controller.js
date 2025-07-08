'use strict';

app.controller('SpaceMicrogridController', function(
    $scope,
    $window,
    $translate,
    SpaceService,
    MicrogridService,
    SpaceMicrogridService,
    toaster, SweetAlert) {
    
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.microgrids = [];
    $scope.spacemicrogrids = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

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
                $scope.currentSpaceID = parseInt(data.selected[0]);
                $scope.getMicrogridsBySpaceID($scope.currentSpaceID);
            });
        });
    };

    $scope.getMicrogridsBySpaceID = function(id) {
        $scope.spacemicrogrids = [];
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceMicrogridService.getMicrogridsBySpaceID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.spacemicrogrids = $scope.spacemicrogrids.concat(response.data);
            } else {
                $scope.spacemicrogrids = [];
            }
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
        });
    };

    $scope.$on('handleBroadcastSpaceChanged', function(event) {
        $scope.spacemicrogrids = [];
        $scope.refreshSpaceTree();
    });

    // 初始化数据
    $scope.getAllSpaces();
    $scope.getAllMicrogrids();
});