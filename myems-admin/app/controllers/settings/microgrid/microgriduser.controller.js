'use strict';

app.controller('MicrogridUserController', function (
    $scope,
    $rootScope,
    $window,
    $timeout,
    $translate,
    MicrogridService,
    UserService,
    MicrogridUserService,
    toaster,
    SweetAlert,
    DragDropWarningService) {
    $scope.currentMicrogrid = {selected:undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isMicrogridSelected = false;
    $scope.getAllUsers = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        UserService.getAllUsers(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.users = response.data;
            } else {
                $scope.users = [];
            }
        });
    };

    $scope.getUsersByMicrogridID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridUserService.getUsersByMicrogridID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.microgridusers = response.data;
            } else {
                $scope.microgridusers = [];
            }
        });
    };

    $scope.changeMicrogrid=function(item,model){
        $scope.currentMicrogrid=item;
        $scope.currentMicrogrid.selected=model;
        if ($scope.currentMicrogrid && $scope.currentMicrogrid.id) {
            $scope.isMicrogridSelected = true;
            $scope.getUsersByMicrogridID($scope.currentMicrogrid.id);
        } else {
            $scope.isMicrogridSelected = false;
        }
    };

    $scope.getAllMicrogrids = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridService.getAllMicrogrids(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.microgrids = response.data;
            } else {
                $scope.microgrids = [];
            }
        });
    };

    $scope.pairUser = function (dragEl, dropEl) {
        var userid = angular.element('#' + dragEl).scope().user.id;
        var microgridid = $scope.currentMicrogrid.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridUserService.addPair(microgridid, userid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_USER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getUsersByMicrogridID($scope.currentMicrogrid.id);
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

    $scope.deleteUserPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var microgriduserid = angular.element('#' + dragEl).scope().microgriduser.id;
        var microgridid = $scope.currentMicrogrid.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MicrogridUserService.deletePair(microgridid, microgriduserid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_USER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getUsersByMicrogridID($scope.currentMicrogrid.id);
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

    $scope.getAllUsers();
    $scope.getAllMicrogrids();

  	$scope.$on('handleBroadcastMicrogridChanged', function(event) {
      $scope.getAllMicrogrids();
  	});

    // Listen directly to HJC-DRAG-DISABLED event and show warning
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        if (!$scope.isMicrogridSelected) {
            // Use rootScope flag to prevent multiple warnings from different controllers
            if (!$rootScope._microgridDragWarningShown) {
                $rootScope._microgridDragWarningShown = true;
                DragDropWarningService.showWarning('SETTING.PLEASE_SELECT_MICROGRID_FIRST');
                $timeout(function() {
                    $rootScope._microgridDragWarningShown = false;
                }, 500); // Reset flag after 500ms
            }
        }
    });
});
