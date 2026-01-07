'use strict';

app.controller('StoreWorkingCalendarController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    StoreService,
    WorkingCalendarService,
    StoreWorkingCalendarService,
    toaster,
    SweetAlert,
    DragDropWarningService) {

    $scope.stores = [];
    $scope.storeworkingcalendars = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentStore = {selected: undefined};
    $scope.isStoreSelected = false;

    $scope.getAllStores = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreService.getAllStores(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.stores = response.data;
            } else {
                $scope.stores = [];
            }
        });
    };


    $scope.getWorkingCalendarsByStoreID = function(storeid) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreWorkingCalendarService.getWorkingCalendarsByStoreID(storeid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.storeworkingcalendars = response.data;
                $scope.getAllWorkingCalendars();
            } else {
                $scope.storeworkingcalendars = [];
                $scope.getAllWorkingCalendars();
            }
        });
    };


    $scope.getAllWorkingCalendars = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        WorkingCalendarService.getAllWorkingCalendars(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allCalendars = response.data;
                $scope.workingcalendars = allCalendars.filter(function(calendar) {
                    return !$scope.storeworkingcalendars.some(function(storecalendar) {
                        return storecalendar.id === calendar.id;
                    });
                });
            } else {
                $scope.workingcalendars = [];
            }
        });
    };


    $scope.changeStore = function(item, model) {
        $scope.currentStore = item;
        $scope.currentStore.selected = model;
        if (item && item.id) {
            $scope.isStoreSelected = true;
            $scope.getWorkingCalendarsByStoreID($scope.currentStore.id);
        } else {
            $scope.isStoreSelected = false;
        }
    };

    $scope.pairWorkingCalendar = function(dragEl, dropEl) {
        if (!$scope.isStoreSelected || !$scope.currentStore || !$scope.currentStore.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_STORE_FIRST");
            return;
        }
        var workingcalendarid = angular.element('#' + dragEl).scope().workingcalendar.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreWorkingCalendarService.addPair(storeid, workingcalendarid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_WORKING_CALENDAR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getWorkingCalendarsByStoreID(storeid);
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
        if (!$scope.isStoreSelected || !$scope.currentStore || !$scope.currentStore.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_STORE_FIRST");
            return;
        }
        var storeworkingcalendarid = angular.element('#' + dragEl).scope().storeworkingcalendar.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreWorkingCalendarService.deletePair(storeid, storeworkingcalendarid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_WORKING_CALENDAR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getWorkingCalendarsByStoreID(storeid); 
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


    $scope.getAllStores();
    $scope.getAllWorkingCalendars();

 
    $scope.$on('handleBroadcastStoreChanged', function(event) {
        $scope.storeworkingcalendars = [];
        $scope.getAllStores();
    });

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
        $scope,
        'BIND_WORKING_CALENDAR',
        'SETTING.PLEASE_SELECT_STORE_FIRST',
        { BIND_WORKING_CALENDAR: 4 }
    );

});
