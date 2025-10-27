'use strict';

app.controller('ShopfloorWorkingCalendarController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    ShopfloorService,
    WorkingCalendarService,
    ShopfloorWorkingCalendarService,
    toaster,
    SweetAlert) {

    $scope.shopfloors = [];
    $scope.shopfloorworkingcalendars = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentShopfloor = {selected: undefined};

    $scope.getAllShopfloors = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorService.getAllShopfloors(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloors = response.data;
            } else {
                $scope.shopfloors = [];
            }
        });
    };

    $scope.getWorkingCalendarsByShopfloorID = function(id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorWorkingCalendarService.getWorkingCalendarsByShopfloorID(id, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloorworkingcalendars = response.data;
            } else {
                $scope.shopfloorworkingcalendars = [];
            }
            $scope.getAllWorkingCalendars();
        });
    };

    $scope.getAllWorkingCalendars = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        WorkingCalendarService.getAllWorkingCalendars(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allCalendars = response.data;
                $scope.workingcalendars = allCalendars.filter(function(calendar) {
                    return !$scope.shopfloorworkingcalendars || !$scope.shopfloorworkingcalendars.some(function(sc) {
                        return sc.id === calendar.id;
                    });
                });
            } else {
                $scope.workingcalendars = [];
            }
        });
    };

    $scope.changeShopfloor = function(item, model) {
        $scope.currentShopfloor = item;
        $scope.currentShopfloor.selected = model;
        $scope.getWorkingCalendarsByShopfloorID($scope.currentShopfloor.id);
    };

    $scope.pairWorkingCalendar = function(dragEl, dropEl) {
        var workingcalendarid = angular.element('#' + dragEl).scope().workingcalendar.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorWorkingCalendarService.addPair(shopfloorid, workingcalendarid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_WORKING_CALENDAR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getWorkingCalendarsByShopfloorID(shopfloorid);
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

    $scope.deleteWorkingCalendarPair = function(dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) return;
        var shopfloorworkingcalendarid = angular.element('#' + dragEl).scope().shopfloorworkingcalendar.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorWorkingCalendarService.deletePair(shopfloorid, shopfloorworkingcalendarid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_WORKING_CALENDAR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getWorkingCalendarsByShopfloorID(shopfloorid);
                $scope.getAllWorkingCalendars();
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

    $scope.getAllShopfloors();
    $scope.getAllWorkingCalendars();

    $scope.$on('handleBroadcastShopfloorChanged', function(event) {
        $scope.shopfloorworkingcalendars = [];
        $scope.getAllShopfloors();
    });

});
