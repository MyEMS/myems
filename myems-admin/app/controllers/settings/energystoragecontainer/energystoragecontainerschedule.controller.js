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

    $scope.t = {};
    function resetScheduleForm() {
        $scope.t.start_hour = "00";
        $scope.t.start_min = "00";
        $scope.t.start_second = "00";
        $scope.t.end_hour = "23";
        $scope.t.end_min = "59";
        $scope.t.end_second = "59";
        $scope.t.peak_type = "midpeak";
        $scope.t.power = 50;
    }
    resetScheduleForm();
    $scope.energystoragecontainerschedules = [];

    $scope.showPeakType = function (type) {
        return PEAK_TYPE[type];
    };

    $scope.error = {
        show: false, message: ''
    };

    $scope.resetScheduleError = function () {
        $scope.error.show = false;
        $scope.error.message = '';
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
        $scope.resetScheduleError();
        resetScheduleForm();
        $scope.currentEnergyStorageContainer = item;
        $scope.currentEnergyStorageContainer.selected = model;
        $scope.is_show_add_energystoragecontainer_schedule = true;
        $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
    };

    $scope.isEndTimeBeforeStartTime = function (startTime, endTime) {
        if (!startTime || !endTime) {
            return true;
        }
        return timeToSeconds(endTime) <= timeToSeconds(startTime);
    };

    function timeToSeconds(timeStr) {
        if (!timeStr) {
            return 0;
        }
        var parts = timeStr.split(':');
        return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
    }

    function hasOverlapWithExisting(startTimeOfDay, endTimeOfDay, excludeId) {
        if (!$scope.energystoragecontainerschedules || $scope.energystoragecontainerschedules.length === 0) {
            return false;
        }
        var newStart = timeToSeconds(startTimeOfDay);
        var newEnd = timeToSeconds(endTimeOfDay);
        return $scope.energystoragecontainerschedules.some(function (schedule) {
            if (excludeId && schedule.id === excludeId) {
                return false;
            }
            var existingStart = timeToSeconds(schedule.start_time_of_day);
            var existingEnd = timeToSeconds(schedule.end_time_of_day);
            return newStart < existingEnd && newEnd > existingStart;
        });
    }

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

    $scope.editEnergyStorageContainerSchedule = function (energystoragecontainerschedule) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/settings/energystoragecontainer/energystoragecontainerschedule.model.html',
            controller: 'ModalEditEnergyStorageContainerScheduleCtrl',
            backdrop: 'static',
            size: 'lg',
            resolve: {
                params: function () {
                    return {
                        energystoragecontainerschedule: angular.copy(energystoragecontainerschedule)
                    };
                }
            }
        });

        modalInstance.result.then(function (modifiedSchedule) {
            // Split time part into hours, minutes, and seconds
            var startTimeParts = modifiedSchedule.start_time_of_day.split(':');
            var endTimeParts = modifiedSchedule.end_time_of_day.split(':');

            modifiedSchedule.start_hour = startTimeParts[0];
            modifiedSchedule.start_min = startTimeParts[1];
            modifiedSchedule.start_second = startTimeParts[2];
            modifiedSchedule.end_hour = endTimeParts[0];
            modifiedSchedule.end_min = endTimeParts[1];
            modifiedSchedule.end_second = endTimeParts[2];

            if (modifiedSchedule.peak_type == null || modifiedSchedule.power == null || modifiedSchedule.peak_type === "") {
                return false;
            }

            if ($scope.isEndTimeBeforeStartTime(modifiedSchedule.start_time_of_day, modifiedSchedule.end_time_of_day)) {
                $scope.error.show = true;
                $scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
                return;
            }

            if (hasOverlapWithExisting(modifiedSchedule.start_time_of_day, modifiedSchedule.end_time_of_day, modifiedSchedule.id)) {
                $scope.error.show = true;
                $scope.error.message = $translate.instant("SETTING.TIME_PERIOD_OVERLAP_ERROR");
                return;
            }

            $scope.error.show = false;
            $scope.error.message = '';

            let headers = {
                "User-UUID": $scope.cur_user.uuid,
                Token: $scope.cur_user.token,
            };

            EnergyStorageContainerScheduleService.editEnergyStorageContainerSchedule(
                $scope.currentEnergyStorageContainer.id,
                modifiedSchedule,
                headers,
                function (response) {
                    if (angular.isDefined(response.status) && response.status === 200) {
                        toaster.pop({
                            type: "success",
                            title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                            body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {
                                template: $translate.instant("SETTING.SCHEDULE"),
                            }),
                            showCloseButton: true,
                        });
                        $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID($scope.currentEnergyStorageContainer.id);
                        $scope.$emit("handleEmitEnergyStorageContainerScheduleChanged");
                    } else {
                        toaster.pop({
                            type: "error",
                            title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {
                                template: $translate.instant("SETTING.SCHEDULE"),
                            }),
                            body: $translate.instant(response.data.description),
                            showCloseButton: true,
                        });
                    }
                }
            );
        }, function () {
            //do nothing;
        });
        $rootScope.modalInstance = modalInstance;
    };

    $scope.addEnergyStorageContainerSchedule = function (t) {
        $scope.resetScheduleError();
        if (!$scope.currentEnergyStorageContainer || !$scope.currentEnergyStorageContainer.id) {
            $scope.error.show = true;
            $scope.error.message = $translate.instant("SETTING.SELECT_ENERGY_STORAGE_CONTAINER");
            return;
        }
        if (!t || t.peak_type == null || t.peak_type === "" || t.power === null || t.power === undefined || t.power === "") {
            $scope.error.show = true;
            $scope.error.message = $translate.instant("SETTING.INVALID_INPUT_HINT");
            return;
        }

        var power = Number(t.power);
        if (isNaN(power) || power < -10000 || power > 10000) {
            $scope.error.show = true;
            $scope.error.message = $translate.instant("SETTING.INVALID_INPUT_HINT");
            return;
        }

        var startTimeOfDay = t.start_hour + ":" + t.start_min + ":" + t.start_second;
        var endTimeOfDay = t.end_hour + ":" + t.end_min + ":" + t.end_second;

        if ($scope.isEndTimeBeforeStartTime(startTimeOfDay, endTimeOfDay)) {
            $scope.error.show = true;
            $scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
            return;
        }

        if (hasOverlapWithExisting(startTimeOfDay, endTimeOfDay)) {
            $scope.error.show = true;
            $scope.error.message = $translate.instant("SETTING.TIME_PERIOD_OVERLAP_ERROR");
            return;
        }

        var payload = {
            start_time_of_day: startTimeOfDay,
            end_time_of_day: endTimeOfDay,
            peak_type: t.peak_type,
            power: power
        };

        let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
        };

        EnergyStorageContainerScheduleService.addEnergyStorageContainerSchedule(
            $scope.currentEnergyStorageContainer.id,
            payload,
            headers,
            function (response) {
                if (angular.isDefined(response.status) && response.status === 201) {
                    toaster.pop({
                        type: "success",
                        title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                        body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {
                            template: $translate.instant("SETTING.SCHEDULE"),
                        }),
                        showCloseButton: true,
                    });
                    $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID(
                        $scope.currentEnergyStorageContainer.id
                    );
                    $scope.$emit("handleEmitEnergyStorageContainerScheduleChanged");
                    $scope.resetScheduleError();
                    resetScheduleForm();
                } else {
                    var message = (response && response.data && response.data.description)
                        ? $translate.instant(response.data.description)
                        : $translate.instant("SETTING.INVALID_INPUT_HINT");
                    $scope.error.show = true;
                    $scope.error.message = message;
                    toaster.pop({
                        type: "error",
                        title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                            template: $translate.instant("SETTING.SCHEDULE"),
                        }),
                        body: message,
                        showCloseButton: true,
                    });
                }
            }
        );
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

app.controller("ModalAddEnergyStorageContainerScheduleCtrl", function ($scope,$timeout,PEAK_TYPE, $uibModalInstance, $translate) {
    $scope.operation = "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_SCHEDULE";
    $scope.controlmode={
        name:'',
        list:[]
    }

    $scope.showPeakType = function (type) {
        console.log(PEAK_TYPE,'PEAK_TYPE')
        return PEAK_TYPE[type];
    };
    $scope.t={}
    $scope.error = {
		show: false,
		message: ''
	};
    $scope.initRow=function(){
        $scope.t.start_hour = "00";
        $scope.t.start_min = "00";
        $scope.t.start_second = "00";
        $scope.t.end_hour = "23";
        $scope.t.end_min = "59";
        $scope.t.end_second = "59";
        $scope.t.peak_type = "midpeak";
        $scope.t.power = 50;
    }

    $scope.initRow()

    $scope.isEndTimeBeforeStartTime = function(t) {

        var startSeconds = parseInt(t.start_hour) * 3600 + parseInt(t.start_min) * 60 + parseInt(t.start_second);
        var endSeconds = parseInt(t.end_hour) * 3600 + parseInt(t.end_min) * 60 + parseInt(t.end_second);

        return endSeconds <= startSeconds;
    };

    $scope.add = function (t){
        if (t.power == null){
			return false;
		}
        if($scope.isEndTimeBeforeStartTime(t)){
			$scope.error.show = true;
			$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
			return;
        }
        $scope.error.show = false;
        $scope.error.message =''
        $scope.controlmode.list.unshift({
            start_time_of_day:t.start_hour+':'+t.start_min+':'+t.start_second,
            end_time_of_day:t.end_hour+':'+t.end_min+':'+t.end_second,
            peak_type:t.peak_type,
            power: t.power
        })
        $scope.initRow()
        $timeout(function() {
			angular.element('#touTable').trigger('footable_redraw');
		}, 10);
    }

    $scope.delete = function (index){
        $scope.controlmode.list.splice(index, 1);
		$timeout(function() {
			angular.element('#touTable').trigger('footable_redraw');
		}, 10);
    }

    $scope.hasTimeOverlap = function() {
		for (var i = 0; i < $scope.controlmode.list.length; i++) {
			for (var j = i + 1; j < $scope.controlmode.list.length; j++) {
				if ($scope.isTimeOverlap($scope.controlmode.list[i], $scope.controlmode.list[j])) {
					return true;
				}
			}
		}
		return false;
	};

    $scope.isTimeOverlap = function(time1, time2) {
		var start1 = $scope.timeToSeconds(time1.start_time_of_day);
		var end1 = $scope.timeToSeconds(time1.end_time_of_day);
		var start2 = $scope.timeToSeconds(time2.start_time_of_day);
		var end2 = $scope.timeToSeconds(time2.end_time_of_day);

		return Math.max(start1, start2) < Math.min(end1, end2);
	};

	$scope.timeToSeconds = function(timeString) {
		var parts = timeString.split(':');
		return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
	};

	$scope.checkFullDayCoverage = function(timeList) {
		if (!timeList || timeList.length === 0) {
			return false;
		}
		function timeToSeconds(timeStr) {
			var parts = timeStr.split(':');
			return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
		}
		var timeRanges = [];
		for (var i = 0; i < timeList.length; i++) {
			var item = timeList[i];
			timeRanges.push({
				start: timeToSeconds(item.start_time_of_day),
				end: timeToSeconds(item.end_time_of_day)
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
		normalizedRanges.sort(function(a, b) {
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

    $scope.ok = function() {
        if($scope.error.show)return
		if ($scope.controlmode.list.length > 0) {
			if ($scope.hasTimeOverlap()) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.TIME_PERIOD_OVERLAP_ERROR");
				return;
			}
			if (!$scope.checkFullDayCoverage($scope.controlmode.list)) {
				$scope.error.show = true;
				$scope.error.message = $translate.instant("SETTING.CONTROL_MODE_NOT_FULL_DAY_COVERAGE");
				return;
			}
		}

		$scope.error.show = false;
        $scope.error.msg = ''
		$uibModalInstance.close($scope.controlmode);
	};


    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
});

app.controller("ModalEditEnergyStorageContainerScheduleCtrl", function ($scope, $uibModalInstance, params) {
    $scope.operation = "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_SCHEDULE";
    $scope.energystoragecontainerschedules = params.energystoragecontainerschedules;
    $scope.t.start_hour = "00";
    $scope.t.start_min = "00";
    $scope.t.start_second = "00";
    $scope.t.end_hour = "23";
    $scope.t.end_min = "59";
    $scope.t.end_second = "59";
    $scope.t.peak_type = "midpeak";
    $scope.t.power = 50;

    $scope.add = function(t) {
		if (t.power_value == null){
			return false;
		}
		t.start_time_of_day= t.start_hour + ':' + t.start_min + ':' + t.start_second;
		t.end_time_of_day= t.end_hour + ':' + t.end_min + ':' + t.end_second;

		if ($scope.isEndTimeBeforeStartTime(t.start_time_of_day, t.end_time_of_day)) {
			$scope.error.show = true;
			$scope.error.message = $translate.instant("SETTING.END_TIME_SHOULD_BE_AFTER_START_TIME");
			return;
		}

		$scope.error.show = false;
    	$scope.error.message = '';

		if ($scope.times.length > 0) {
			$scope.times.unshift(angular.copy(t));
		} else {
			$scope.times.push(angular.copy(t));
		}
		$scope.t={};
		$scope.t.start_hour = '00';
		$scope.t.start_min = '00';
		$scope.t.start_second = '00';
		$scope.t.end_hour = '23';
		$scope.t.end_min = '59';
		$scope.t.end_second = '59';
		$scope.t.power_value = 5;

		$timeout(function() {
			angular.element('#touTable').trigger('footable_redraw');
		}, 10);
	};
	$scope.delete = function(key) {
		$scope.times.splice(key, 1);
		$timeout(function() {
			angular.element('#touTable').trigger('footable_redraw');
		}, 10);
	};

    $scope.ok = function () {
        $uibModalInstance.close($scope.energystoragecontainerschedule);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
});
