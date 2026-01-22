'use strict';

app.controller('TenantWorkingCalendarController', function(
    $scope ,
    $window,
    $timeout,
    $translate,
    TenantService,
    WorkingCalendarService,
    TenantWorkingCalendarService, toaster,SweetAlert,
    DragDropWarningService) {
    $scope.tenants = [];
    $scope.currentTenantID = 1;
    $scope.tenantworkingcalendars = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentTenant = {selected:undefined};
    $scope.isTenantSelected = false;
    $scope.changeTenant=function(item,model){
      $scope.currentTenant=item;
      $scope.currentTenant.selected=model;
      if (item && item.id) {
          $scope.isTenantSelected = true;
          $scope.getWorkingCalendarsByTenantID($scope.currentTenant.id);
      } else {
          $scope.isTenantSelected = false;
          $scope.tenantworkingcalendars = [];
          $scope.filterAvailableWorkingCalendars();
      }
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
              $scope.filterAvailableWorkingCalendars();
            } else {
              $scope.filterAvailableWorkingCalendars();
            }
      });
	};

	$scope.getAllWorkingCalendars = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WorkingCalendarService.getAllWorkingCalendars(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.workingcalendars = response.data;
				$scope.filterAvailableWorkingCalendars();
			} else {
				$scope.workingcalendars = [];
				$scope.filteredWorkingCalendars = [];
			}
		});

	};

	$scope.filterAvailableWorkingCalendars = function() {
        var boundSet = {};
        ($scope.tenantworkingcalendars || []).forEach(function(twc) {
            if (angular.isDefined(twc.id)) {
                boundSet[twc.id] = true;
            }
        });

        $scope.filteredWorkingCalendars = ($scope.workingcalendars || []).filter(function(wc){
            return !boundSet[wc.id];
        });
    };

	$scope.pairWorkingCalendar=function(dragEl,dropEl){
		if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
		    DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
		    return;
		}
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
        if (!$scope.isTenantSelected || !$scope.currentTenant || !$scope.currentTenant.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_TENANT_FIRST");
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
        if ($scope.currentTenant && $scope.currentTenant.id) {
            $scope.getWorkingCalendarsByTenantID($scope.currentTenant.id);
        }
	});

    // Listen for tab selection event
    $scope.$on('tenant.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_WORKING_CALENDAR && $scope.currentTenant && $scope.currentTenant.id) {
            $scope.getWorkingCalendarsByTenantID($scope.currentTenant.id);
        }
    });

    // Check on initialization if tab is already active
    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_WORKING_CALENDAR && 
            $scope.currentTenant && $scope.currentTenant.id) {
            $scope.getWorkingCalendarsByTenantID($scope.currentTenant.id);
        }
    }, 0);

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'BIND_WORKING_CALENDAR',
            'SETTING.PLEASE_SELECT_TENANT_FIRST',
            { BIND_WORKING_CALENDAR: 5 }
        );

});
