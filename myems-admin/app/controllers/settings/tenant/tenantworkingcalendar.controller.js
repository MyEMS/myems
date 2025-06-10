'use strict';

app.controller('TenantWorkingCalendarController', function(
    $scope ,
    $window,
    $timeout,
    $translate,
    TenantService,
    WorkingCalendarService,
    TenantWorkingCalendarService, toaster,SweetAlert) {
    $scope.tenants = [];
    $scope.currentTenantID = 1;
    $scope.tenantworkingcalendars = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

    $scope.changeTenant=function(item,model){
      $scope.currentTenant=item;
      $scope.currentTenant.selected=model;
      $scope.getWorkingCalendarsByTenantID($scope.currentTenant.id);
    };

  $scope.getAllTenants = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantService.getAllTenants(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.tenants = response.data;
				} else {
				$scope.tenants = [];
			 }
		});
	};

	$scope.getWorkingCalendarsByTenantID = function(id) {
      $scope.tenantworkingcalendars=[];
      let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
      TenantWorkingCalendarService.getWorkingCalendarsByTenantID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.tenantworkingcalendars = response.data;
            }
      });
	};

	$scope.getAllWorkingCalendars = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WorkingCalendarService.getAllWorkingCalendars(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.workingcalendars = response.data;
			} else {
				$scope.workingcalendars = [];
			}
		});

	};

	$scope.pairWorkingCalendar=function(dragEl,dropEl){
		var workingcalendarid=angular.element('#'+dragEl).scope().workingcalendar.id;
    var tenantid = $scope.currentTenant.id;
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TenantWorkingCalendarService.addPair(tenantid, workingcalendarid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_WORKING_CALENDAR_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getWorkingCalendarsByTenantID(tenantid);
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

	$scope.deleteWorkingCalendarPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var tenantworkingcalendarid = angular.element('#' + dragEl).scope().tenantworkingcalendar.id;
        var tenantid = $scope.currentTenant.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        TenantWorkingCalendarService.deletePair(tenantid, tenantworkingcalendarid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_WORKING_CALENDAR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getWorkingCalendarsByTenantID(tenantid);
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

    $scope.getAllTenants();
    $scope.getAllWorkingCalendars();

	$scope.$on('handleBroadcastTenantChanged', function(event) {
    $scope.tenantworkingcalendars = [];
    $scope.getAllTenants();
	});

});
