'use strict';

app.controller('HybridPowerStationUserController', function (
    $scope,
    $window,
    $translate,
    HybridPowerStationService,
    UserService,
    HybridPowerStationUserService,
    toaster,
    SweetAlert) {
    $scope.currentHybridPowerStation = {selected:undefined};
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

    $scope.getUsersByHybridPowerStationID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        HybridPowerStationUserService.getUsersByHybridPowerStationID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.hybridpowerstationusers = response.data;
            } else {
                $scope.hybridpowerstationusers = [];
            }
        });
    };

    $scope.changeHybridPowerStation=function(item,model){
        $scope.currentHybridPowerStation=item;
        $scope.currentHybridPowerStation.selected=model;
        $scope.getUsersByHybridPowerStationID($scope.currentHybridPowerStation.id);
    };

    $scope.getAllHybridPowerStations = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        HybridPowerStationService.getAllHybridPowerStations(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.hybridpowerstations = response.data;
            } else {
                $scope.hybridpowerstations = [];
            }
        });
    };

    $scope.pairUser = function (dragEl, dropEl) {
        var userid = angular.element('#' + dragEl).scope().user.id;
        var hybridpowerstationid = $scope.currentHybridPowerStation.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        HybridPowerStationUserService.addPair(hybridpowerstationid, userid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_USER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getUsersByHybridPowerStationID($scope.currentHybridPowerStation.id);
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
        var hybridpowerstationuserid = angular.element('#' + dragEl).scope().hybridpowerstationuser.id;
        var hybridpowerstationid = $scope.currentHybridPowerStation.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        HybridPowerStationUserService.deletePair(hybridpowerstationid, hybridpowerstationuserid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_USER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getUsersByHybridPowerStationID($scope.currentHybridPowerStation.id);
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
    $scope.getAllHybridPowerStations();

  	$scope.$on('handleBroadcastHybridPowerStationChanged', function(event) {
      $scope.getAllHybridPowerStations();
  	});
});
