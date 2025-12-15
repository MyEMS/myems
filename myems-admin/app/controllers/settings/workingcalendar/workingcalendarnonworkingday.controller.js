'use strict';

const WEEKEND_DAYS = {
  SUNDAY: 0,
  SATURDAY: 6
};

app.controller('WorkingCalendarNonWorkingDayController', function (
    $scope,
    $rootScope,
    $window,
    $timeout,
    $translate,
    $uibModal,
    WorkingCalendarService,
    WorkingCalendarNonWorkingDayService,
    toaster,
    SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentWorkingCalendar = {};
    $scope.date_local = moment().format('YYYY-MM-DD'),
    $scope.month = moment().format('YYYY-MM'),
    $scope.days = [],
    $scope.nonWorkingDaysFlagArray = [],

    $scope.getNonWorkingDaysByWorkingCalendarID = function (id) {
        if (!id) {
            $scope.nonworkingdays = [];
            return;
        }
        WorkingCalendarNonWorkingDayService.getNonWorkingDaysByWorkingCalendarID(id, {}, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.nonworkingdays = response.data;
                $scope.handleDays();
            } else {
                $scope.nonworkingdays = [];
            }
        });
    };

    $scope.changeWorkingCalendar=function(item,model){
  	  $scope.currentWorkingCalendar=item;
  	  $scope.currentWorkingCalendar.selected=model;
  	  $scope.getNonWorkingDaysByWorkingCalendarID(item ? item.id : null);
    };

    $scope.getAllWorkingCalendars = function () {
        WorkingCalendarService.getAllWorkingCalendars({}, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.workingcalendars = response.data;
                if ($scope.workingcalendars.length > 0 && !$scope.currentWorkingCalendar.id) {
                    $scope.currentWorkingCalendar = $scope.workingcalendars[0];
                    $timeout(function () {
                        $scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
                    }, 500);
                }
            } else {
                $scope.workingcalendars = [];
            }
        });
    };

    $scope.addNonWorkingDay = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/workingcalendar/nonworkingday.model.html',
			controller: 'ModalAddNonWorkingDayCtrl',
			windowClass: "animated fadeIn",
            resolve: {
				params: function() {
					return {
                        workingCalendar: angular.copy($scope.currentWorkingCalendar),
					};
				}
			}
		});

		modalInstance.result.then(function(nonWorkingDay) {
			WorkingCalendarNonWorkingDayService.addNonWorkingDay(nonWorkingDay.working_calendar_id, nonWorkingDay, {}, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.NON_WORKING_DAY")}),
						showCloseButton: true,
					});
					$scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.NON_WORKING_DAY")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {});
        $rootScope.modalInstance = modalInstance;
	};

    $scope.batchAddWeekendNonWorkingDay = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/settings/workingcalendar/batch-weekend-nonworkingday.model.html',
            controller: 'ModalBatchAddWeekendNonWorkingDayCtrl',
            windowClass: "animated fadeIn",
            resolve: {
                params: function() {
                    return {
                        workingCalendar: angular.copy($scope.currentWorkingCalendar),
                    };
                }
            }
        });

        modalInstance.result.then(function(batchParams) {
            $scope.handleBatchAddWeekend(batchParams);
        }, function() {});
        $rootScope.modalInstance = modalInstance;
    };

    $scope.handleBatchAddWeekend = function(params) {
        const startDate = moment(params.startDate);
        const endDate = moment(params.endDate);
        const workingCalendarId = params.workingCalendarId;
        const description = params.description;

        if (startDate.isAfter(endDate)) {
            toaster.pop({type: "error", title: $translate.instant("TOASTER.ERROR_ADD_BODY"), body: $translate.instant("SETTING.START_DATE_AFTER_END_DATE"), showCloseButton: true});
            return;
        }

        const weekendDates = [];
        let currentDate = startDate.clone();
        while (currentDate.isSameOrBefore(endDate)) {
            const day = currentDate.day();
            if (day === WEEKEND_DAYS.SUNDAY || day === WEEKEND_DAYS.SATURDAY) {
                weekendDates.push(currentDate.format('YYYY-MM-DD'));
            }
            currentDate.add(1, 'day');
        }

        if (weekendDates.length === 0) {
            toaster.pop({type: "error", title: $translate.instant("TOASTER.ERROR_ADD_BODY"), body: $translate.instant("SETTING.NO_WEEKEND_IN_RANGE"), showCloseButton: true});
            return;
        }

        let successCount = 0;
        let failCount = 0;
        const total = weekendDates.length;
        const batchSize = 10;

        const processBatch = async () => {
            for (let i = 0; i < weekendDates.length; i += batchSize) {
                const batch = weekendDates.slice(i, i + batchSize);
                const requests = batch.map(date => {
                    const nonWorkingDay = {
                        working_calendar_id: workingCalendarId,
                        date_local: date,
                        description: description
                    };
                    return new Promise((resolve) => {
                        WorkingCalendarNonWorkingDayService.addNonWorkingDay(workingCalendarId, nonWorkingDay, {}, (response) => {
                            if (response.status === 201) {
                                successCount++;
                            } else {
                                failCount++;
                            }
                            resolve();
                        });
                    });
                });
                await Promise.all(requests);
            }

            const isSuccess = successCount > 0;
            toaster.pop({
                type: isSuccess ? "success" : "error",
                title: $translate.instant(isSuccess ? "TOASTER.SUCCESS_TITLE" : "TOASTER.ERROR_ADD_BODY"),
                body: $translate.instant("SETTING.BATCH_ADD_RESULT", {success: successCount, fail: failCount, total: total}),
                showCloseButton: true,
            });
            $scope.getNonWorkingDaysByWorkingCalendarID(workingCalendarId);
        };

        processBatch();
    };

    $scope.editNonWorkingDay = function(nonWorkingDay) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/workingcalendar/nonworkingday.model.html',
			controller: 'ModalEditNonWorkingDayCtrl',
			resolve: {
				params: function() {
					return {
						nonWorkingDay: angular.copy(nonWorkingDay),
                        workingCalendar: angular.copy($scope.currentWorkingCalendar),
					};
				}
			}
		});

		modalInstance.result.then(function(nonWorkingDay) {
			WorkingCalendarNonWorkingDayService.editNonWorkingDay(nonWorkingDay.id, nonWorkingDay, {}, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.NON_WORKING_DAY")}),
						showCloseButton: true,
					});
					$scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.NON_WORKING_DAY")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {});
        $rootScope.modalInstance = modalInstance;
	};

	$scope.deleteNonWorkingDay = function(nonworkingday) {
		SweetAlert.swal({
				title: $translate.instant("SWEET.TITLE"),
				text: $translate.instant("SWEET.TEXT"),
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
				cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function(isConfirm) {
				if (isConfirm) {
					WorkingCalendarNonWorkingDayService.deleteNonWorkingDay(nonworkingday.id, {}, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.NON_WORKING_DAY")}),
                                showCloseButton: true,
                            });
							$scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
						} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.NON_WORKING_DAY")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
						}
					});
				}
			});
	};

    $scope.handleDays = function() {
        $scope.days = [];
        $scope.nonWorkingDaysFlagArray = [];
        let non_working_days = $scope.nonworkingdays.map((item) => {return item.date_local})
        let range = moment($scope.month).endOf('month').date();
        for(let i = 0; i < range; i++){
          let date = moment($scope.month).startOf('month').add(i, 'd').format('YYYY-MM-DD');
          $scope.days.push(date)
          if(non_working_days.indexOf(date) != -1) {
            $scope.nonWorkingDaysFlagArray.push(true);
          }else{
            $scope.nonWorkingDaysFlagArray.push(false);
          }
        }
      }

    $scope.changeMonth = function(num) {
        $scope.month = moment($scope.month).add(num, 'months').format('YYYY-MM');
        $scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
    }

    $scope.getAllWorkingCalendars();

  	$scope.$on('handleBroadcastWorkingCalendarChanged', function(event) {
      $scope.getAllWorkingCalendars();
  	});
});

app.controller('ModalAddNonWorkingDayCtrl', function ($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.ADD_NON_WORKING_DAY";
    $scope.nonWorkingDay = {
        date_local: moment().format('YYYY-MM-DD'),
    };
	$scope.dtOptions = {
        locale: {
            format: 'YYYY-MM-DD',
            applyLabel: "OK",
            cancelLabel: "Cancel",
        },
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 15,
        singleDatePicker: true,
    };
    $scope.workingCalendar = params.workingCalendar;

	$scope.ok = function() {
        $scope.nonWorkingDay.working_calendar_id = $scope.workingCalendar.id;
        $scope.nonWorkingDay.date_local = moment($scope.nonWorkingDay.date_local).format('YYYY-MM-DD');
		$uibModalInstance.close($scope.nonWorkingDay);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditNonWorkingDayCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_NON_WORKING_DAY";
	$scope.nonWorkingDay = params.nonWorkingDay;
    $scope.workingCalendar = params.workingCalendar;
    $scope.dtOptions = {
        locale: {
            format: 'YYYY-MM-DD',
            applyLabel: "OK",
            cancelLabel: "Cancel",
        },
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 15,
        singleDatePicker: true,
    };
	$scope.ok = function() {
        $scope.nonWorkingDay.working_calendar_id = $scope.workingCalendar.id;
        $scope.nonWorkingDay.date_local = moment($scope.nonWorkingDay.date_local).format('YYYY-MM-DD');
		$uibModalInstance.close($scope.nonWorkingDay);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalBatchAddWeekendNonWorkingDayCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation = "SETTING.BATCH_ADD_WEEKEND";
    $scope.batchParams = {
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().add(1, 'month').format('YYYY-MM-DD'),
        description: '',
        workingCalendarId: params.workingCalendar.id
    };
    $scope.workingCalendar = params.workingCalendar;

    $scope.dtOptions = {
        locale: {
            format: 'YYYY-MM-DD',
            applyLabel: "OK",
            cancelLabel: "Cancel",
        },
        timePicker: false,
        timePicker24Hour: true,
        singleDatePicker: true,
    };

    $scope.ok = function() {
        $uibModalInstance.close($scope.batchParams);
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});

app.factory('authInterceptor', function($q, $rootScope) {
    return {
        request: function(config) {
            const currentUser = JSON.parse(localStorage.getItem('myems_admin_ui_current_user'));
            if (currentUser) {
                config.headers['User-UUID'] = currentUser.uuid;
                config.headers['Token'] = currentUser.token;
            }
            return config;
        },
        responseError: function(rejection) {
            if (rejection.status === 401 || rejection.status === 403) {
                $rootScope.$broadcast('auth:logout');
                localStorage.removeItem('myems_admin_ui_current_user');
            }
            return $q.reject(rejection);
        }
    };
});

app.config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});