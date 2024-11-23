'use strict';

app.controller('PhotovoltaicPowerStationUserController', function (
    $scope,
    $window,
    $translate,
    PhotovoltaicPowerStationService,
    UserService,
    PhotovoltaicPowerStationUserService,
    toaster,
    SweetAlert) {
    $scope.currentPhotovoltaicPowerStation = {selected:undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
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

    $scope.getUsersByPhotovoltaicPowerStationID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        PhotovoltaicPowerStationUserService.getUsersByPhotovoltaicPowerStationID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.photovoltaicpowerstationusers = response.data;
            } else {
                $scope.photovoltaicpowerstationusers = [];
            }
        });
    };

    $scope.changePhotovoltaicPowerStation=function(item,model){
        $scope.currentPhotovoltaicPowerStation=item;
        $scope.currentPhotovoltaicPowerStation.selected=model;
        $scope.getUsersByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
    };

    $scope.getAllPhotovoltaicPowerStations = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        PhotovoltaicPowerStationService.getAllPhotovoltaicPowerStations(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.photovoltaicpowerstations = response.data;
            } else {
                $scope.photovoltaicpowerstations = [];
            }
        });
    };

    $scope.pairUser = function (dragEl, dropEl) {
        var userid = angular.element('#' + dragEl).scope().user.id;
        var photovoltaicpowerstationid = $scope.currentPhotovoltaicPowerStation.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        PhotovoltaicPowerStationUserService.addPair(photovoltaicpowerstationid, userid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_USER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getUsersByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
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
        var photovoltaicpowerstationuserid = angular.element('#' + dragEl).scope().photovoltaicpowerstationuser.id;
        var photovoltaicpowerstationid = $scope.currentPhotovoltaicPowerStation.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        PhotovoltaicPowerStationUserService.deletePair(photovoltaicpowerstationid, photovoltaicpowerstationuserid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_USER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getUsersByPhotovoltaicPowerStationID($scope.currentPhotovoltaicPowerStation.id);
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
    $scope.getAllPhotovoltaicPowerStations();

  	$scope.$on('handleBroadcastPhotovoltaicPowerStationChanged', function(event) {
      $scope.getAllPhotovoltaicPowerStations();
  	});
});
