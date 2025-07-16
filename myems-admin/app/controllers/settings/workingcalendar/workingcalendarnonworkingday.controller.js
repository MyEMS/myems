'use strict';

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
    $scope.currentWorkingCalendar = {selected:undefined};
    $scope.date_local = moment().format('YYYY-MM-DD'),
    $scope.month = moment().format('YYYY-MM'),
    $scope.days = [],
    $scope.nonWorkingDaysFlagArray = [],

    $scope.getNonWorkingDaysByWorkingCalendarID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        WorkingCalendarNonWorkingDayService.getNonWorkingDaysByWorkingCalendarID(id, headers, function (response) {
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
  	  $scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
    };


    $scope.getAllWorkingCalendars = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        WorkingCalendarService.getAllWorkingCalendars(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.workingcalendars = response.data;
                $timeout(function () {
                    $scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
                }, 1000);
            } else {
                $scope.sensors = [];
            }
        });

    };

    $scope.addNonWorkingDay = function () {
        var nonWorkingDay = {'workingCalendarID': $scope.workingCalendar.workingCalendarID, 'date_local': $scope.date_local};
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        WorkingCalendarNonWorkingDayService.addNonWorkingDay(nonWorkingDay, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant('TOASTER.BIND_NON_WORKING_DAY_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
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

    $scope.deleteNonWorkingDay= function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var nonWorkingDayID = angular.element('#' + dragEl).scope().nonWorkingDay.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        WorkingCalendarNonWorkingDayService.deleteNonWorkingDay(nonWorkingDayID, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_NON_WORKING_DAY_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getNonWorkingDaysByWorkingCalendarID($scope.currentWorkingCalendar.id);
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WorkingCalendarNonWorkingDayService.addNonWorkingDay(nonWorkingDay.working_calendar_id, nonWorkingDay,
                 headers, function (response) {
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
		}, function() {

		});
        $rootScope.modalInstance = modalInstance;
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
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WorkingCalendarNonWorkingDayService.editNonWorkingDay(nonWorkingDay.id, nonWorkingDay, headers, function (response) {
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
		}, function() {
			//do nothing;
		});
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
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
					WorkingCalendarNonWorkingDayService.deleteNonWorkingDay(nonworkingday.id, headers, function (response) {
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