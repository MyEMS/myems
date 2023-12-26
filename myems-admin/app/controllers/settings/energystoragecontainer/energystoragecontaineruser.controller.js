'use strict';

app.controller('EnergyStorageContainerUserController', function (
    $scope,
    $window,
    $translate,
    EnergyStorageContainerService,
    UserService,
    EnergyStorageContainerUserService,
    toaster,
    SweetAlert) {
    $scope.currentEnergyStorageContainer = {selected:undefined};
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

    $scope.getUsersByEnergyStorageContainerID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStorageContainerUserService.getUsersByEnergyStorageContainerID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.energystoragecontainerusers = response.data;
            } else {
                $scope.energystoragecontainerusers = [];
            }
        });
    };

    $scope.changeEnergyStorageContainer=function(item,model){
        $scope.currentEnergyStorageContainer=item;
        $scope.currentEnergyStorageContainer.selected=model;
        $scope.getUsersByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
    };

    $scope.getAllEnergyStorageContainers = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStorageContainerService.getAllEnergyStorageContainers(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.energystoragecontainers = response.data;
            } else {
                $scope.energystoragecontainers = [];
            }
        });
    };

    $scope.pairUser = function (dragEl, dropEl) {
        var userid = angular.element('#' + dragEl).scope().user.id;
        var energystoragecontainerid = $scope.currentEnergyStorageContainer.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStorageContainerUserService.addPair(energystoragecontainerid, userid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_USER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getUsersByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
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
        var energystoragecontaineruserid = angular.element('#' + dragEl).scope().energystoragecontaineruser.id;
        var energystoragecontainerid = $scope.currentEnergyStorageContainer.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EnergyStorageContainerUserService.deletePair(energystoragecontainerid, energystoragecontaineruserid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_USER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getUsersByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
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
    $scope.getAllEnergyStorageContainers();

  	$scope.$on('handleBroadcastEnergyStorageContainerChanged', function(event) {
      $scope.getAllEnergyStorageContainers();
  	});
});
