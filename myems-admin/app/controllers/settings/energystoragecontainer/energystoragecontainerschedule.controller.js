"use strict";

app.controller("EnergyStorageContainerScheduleController", function ($scope, $rootScope, $window, $translate, $uibModal, PEAK_TYPE, EnergyStorageContainerService, EnergyStorageContainerScheduleService, toaster, SweetAlert) {
    $scope.energystoragecontainers = [];
    $scope.energystoragecontainerschedules = [];
    $scope.currentEnergyStorageContainer = null;
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.getAllEnergyStorageContainers = function () {
        let headers = {
            "User-UUID": $scope.cur_user.uuid, Token: $scope.cur_user.token,
        };
        EnergyStorageContainerService.getAllEnergyStorageContainers(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.energystoragecontainers = response.data;
            } else {
                $scope.energystoragecontainers = [];
            }
        });
    };
    $scope.energystoragecontainerschedules = [];
    $scope.t = {};
    $scope.t.start_hour = "00";
    $scope.t.start_min = "00";
    $scope.t.start_second = "00";
    $scope.t.end_hour = "23";
    $scope.t.end_min = "59";
    $scope.t.end_second = "59";
    $scope.t.peak_type = "midpeak";
    $scope.t.power = 50;

    $scope.showPeakType = function (type) {
        return PEAK_TYPE[type];
    };

    $scope.error = {
        show: false, message: ''
    };

    $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID = function (id) {
        let headers = {
            "User-UUID": $scope.cur_user.uuid, Token: $scope.cur_user.token,
        };
        EnergyStorageContainerScheduleService.getEnergyStorageContainerSchedulesByEnergyStorageContainerID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.energystoragecontainerschedules = response.data;
            } else {
                $scope.energystoragecontainerschedules = [];
            }
        });
    };

    $scope.changeEnergyStorageContainer = function (item, model) {
        $scope.currentEnergyStorageContainer = item;
        $scope.currentEnergyStorageContainer.selected = model;
        $scope.is_show_add_energystoragecontainer_schedule = true;
        $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
    };

    $scope.isEndTimeBeforeStartTime = function (startTime, endTime) {
        if (!startTime || !endTime) {
            return true;
        }
        var startParts = startTime.split(':');
        var endParts = endTime.split(':');

        var startSeconds = parseInt(startParts[0]) * 3600 + parseInt(startParts[1]) * 60 + parseInt(startParts[2]);
        var endSeconds = parseInt(endParts[0]) * 3600 + parseInt(endParts[1]) * 60 + parseInt(endParts[2]);

        return endSeconds <= startSeconds;
    };

    $scope.checkFullDayCoverage = function (schedules) {
        if (!schedules || schedules.length === 0) {
            return false;
        }

        function timeToSeconds(timeStr) {
            var parts = timeStr.split(':');
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }

        var timeRanges = [];
        for (var i = 0; i < schedules.length; i++) {
            var item = schedules[i];
            timeRanges.push({
                start: timeToSeconds(item.start_time_of_day), end: timeToSeconds(item.end_time_of_day)
            });
        }
        var normalizedRanges = [];
        for (var i = 0; i < timeRanges.length; i++) {
            var range = timeRanges[i];
            if (range.end <= range.start) {
                normalizedRanges.push({start: range.start, end: 24 * 3600});
                normalizedRanges.push({start: 0, end: range.end});
            } else {
                normalizedRanges.push(range);
            }
        }
        normalizedRanges.sort(function (a, b) {
            return a.start - b.start;
        });
        if (normalizedRanges[0].start !== 0) {
            return false;
        }
        var currentTime = 0;
        for (var i = 0; i < normalizedRanges.length; i++) {
            var range = normalizedRanges[i];
            if (range.start > currentTime + 1) {
                return false;
            }
            currentTime = Math.max(currentTime, range.end);
        }
        return currentTime >= 24 * 3600 - 1;
    };

    $scope.addEnergyStorageContainerSchedule = function (t) {
        if (t.peak_type == null || t.power == null || t.peak_type === "") {
            return false;
        }
        t.start_time_of_day = t.start_hour + ":" + t.start_min + ":" + t.start_second;
        t.end_time_of_day = t.end_hour + ":" + t.end_min + ":" + t.end_second;

        if ($scope.isEndTimeBeforeStartTime(t.start_time_of_day, t.end_time_of_day)) {
            $scope.error.show = true;
            $scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
            return;
        }

        var tempSchedules = angular.copy($scope.energystoragecontainerschedules);
        tempSchedules.push(angular.copy(t));

        if (!$scope.checkFullDayCoverage(tempSchedules)) {
            $scope.error.show = true;
            $scope.error.message = $translate.instant("SETTING.SCHEDULE_NOT_FULL_DAY_COVERAGE");
            return;
        }

        $scope.error.show = false;
        $scope.error.message = '';

        // $timeout(function() {
        // 	angular.element('#touTable').trigger('footable_redraw');
        // }, 10);

        let headers = {
            "User-UUID": $scope.cur_user.uuid, Token: $scope.cur_user.token,
        };

        EnergyStorageContainerScheduleService.addEnergyStorageContainerSchedule($scope.currentEnergyStorageContainer.id, t, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {
                        template: $translate.instant("SETTING.SCHEDULE"),
                    }),
                    showCloseButton: true,
                });
                $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
                $scope.$emit("handleEmitEnergyStorageContainerScheduleChanged");
            } else {
                toaster.pop({
                    type: "error", title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                        template: $translate.instant("SETTING.SCHEDULE"),
                    }), body: $translate.instant(response.data.description), showCloseButton: true,
                });
            }
        });
    };

    $scope.deleteEnergyStorageContainerSchedule = function (energystoragecontainerschedule) {
        SweetAlert.swal({
            title: $translate.instant("SWEET.TITLE"),
            text: $translate.instant("SWEET.TEXT"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
            cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
            closeOnConfirm: true,
            closeOnCancel: true,
        }, function (isConfirm) {
            if (isConfirm) {
                let headers = {
                    "User-UUID": $scope.cur_user.uuid, Token: $scope.cur_user.token,
                };
                EnergyStorageContainerScheduleService.deleteEnergyStorageContainerSchedule($scope.currentEnergyStorageContainer.id, energystoragecontainerschedule.id, headers, function (response) {
                    if (angular.isDefined(response.status) && response.status === 204) {
                        toaster.pop({
                            type: "success",
                            title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                            body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {
                                template: $translate.instant("SETTING.SCHEDULE"),
                            }),
                            showCloseButton: true,
                        });
                        $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
                        $scope.$emit("handleEmitEnergyStorageContainerScheduleChanged");
                    } else {
                        toaster.pop({
                            type: "error", title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {
                                template: $translate.instant("SETTING.SCHEDULE"),
                            }), body: $translate.instant(response.data.description), showCloseButton: true,
                        });
                    }
                });
            }
        });
    };

    $scope.getAllEnergyStorageContainers();
    $scope.$on("handleBroadcastEnergyStorageContainerChanged", function (event) {
        $scope.getAllEnergyStorageContainers();
    });
});

app.controller("ModalAddEnergyStorageContainerScheduleCtrl", function ($scope, $uibModalInstance, params) {
    $scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_SCHEDULE";
    $scope.ok = function () {
        $uibModalInstance.close($scope.energystoragecontainerschedule);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
});

app.controller("ModalEditEnergyStorageContainerScheduleCtrl", function ($scope, $uibModalInstance, params) {
    $scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_SCHEDULE";
    $scope.energystoragecontainerschedule = params.energystoragecontainerschedule;
    $scope.ok = function () {
        $uibModalInstance.close($scope.energystoragecontainerschedule);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
});
