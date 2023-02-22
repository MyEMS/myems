'use strict';

app.controller('WorkingCalendarNonWorkingDayController', function (
    $scope, 
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
        WorkingCalendarNonWorkingDayService.getNonWorkingDaysByWorkingCalendarID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.nonworkingdays = response.data.filter((item) => {return item.date_local.indexOf($scope.month) > -1});
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
        WorkingCalendarService.getAllWorkingCalendars(function (response) {
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
            console.log(response);
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
                        workingCalendars: $scope.workingcalendars,
					};
				}
			}
		});

		modalInstance.result.then(function (nonWorkingDay) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
            var nonWorkingDay = {"working_calendar_id": nonWorkingDay.working_calendar_id, "date_local": nonWorkingDay.date_local}
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
					$scope.$emit('handleEmitWorkingCalendarChanged');
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
    $scope.workingCalendars = params.workingCalendars;
    
	$scope.ok = function() {
        $scope.nonWorkingDay.date_local = moment($scope.nonWorkingDay.date_local).format('YYYY-MM-DD');
		$uibModalInstance.close($scope.nonWorkingDay);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});