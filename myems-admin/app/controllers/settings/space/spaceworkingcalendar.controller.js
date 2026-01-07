'use strict';

app.controller('SpaceWorkingCalendarController', function(
    $scope ,
    $window,
    $timeout,
    $translate,
    SpaceService,
    WorkingCalendarService,
    SpaceWorkingCalendarService, toaster,SweetAlert,
    DragDropWarningService) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.spaceworkingcalendars = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingWorkingcalendars = false;
    $scope.tabInitialized = false;
    $scope.isSpaceSelected = false;
    $scope.getAllSpaces = function() {
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceService.getAllSpaces(headers, function (response) {
      if (angular.isDefined(response.status) && response.status === 200) {
        $scope.spaces = response.data;
      } else {
        $scope.spaces = [];
      }
      //create space tree
      var treedata = {'core': {'data': [], "multiple" : false,}, "plugins" : [ "wholerow" ]};
      for(var i=0; i < $scope.spaces.length; i++) {
          if ($scope.spaces[i].id == 1) {
            var node = {"id": $scope.spaces[i].id.toString(),
                                "parent": '#',
                                "text": $scope.spaces[i].name,
                                "state": {  'opened' : true,  'selected' : false },
                               };
          } else {
              var node = {"id": $scope.spaces[i].id.toString(),
                                  "parent": $scope.spaces[i].parent_space.id.toString(),
                                  "text": $scope.spaces[i].name,
                                 };
          };
          treedata['core']['data'].push(node);
      }

      angular.element(spacetreewithworkingcalendar).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithworkingcalendar).on("changed.jstree", function (e, data) {
          if (data.selected && data.selected.length > 0) {
              $scope.currentSpaceID = parseInt(data.selected[0]);
              $scope.isSpaceSelected = true;
              $scope.spaceworkingcalendars=[];
              $scope.getWorkingCalendarsBySpaceID($scope.currentSpaceID);
          } else {
              $scope.isSpaceSelected = false;
              $scope.spaceworkingcalendars = [];
          }
          if (!$scope.$$phase && !$scope.$root.$$phase) {
              $scope.$apply();
          }
      });
    });
    };

	$scope.getWorkingCalendarsBySpaceID = function(id) {
	  if($scope.isLoadingWorkingcalendars) return;
	  $scope.isLoadingWorkingcalendars = true;
	  $scope.spaceworkingcalendars=[];
      let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
      SpaceWorkingCalendarService.getWorkingCalendarsBySpaceID(id, headers, function (response) {
            $scope.isLoadingWorkingcalendars = false;
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.spaceworkingcalendars = response.data;
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
		var spaceid=angular.element(spacetreewithworkingcalendar).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceWorkingCalendarService.addPair(spaceid, workingcalendarid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_WORKING_CALENDAR_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getWorkingCalendarsBySpaceID(spaceid);
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
        var spaceworkingcalendarid = angular.element('#' + dragEl).scope().spaceworkingcalendar.id;
        var spaceid = angular.element(spacetreewithworkingcalendar).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceWorkingCalendarService.deletePair(spaceid, spaceworkingcalendarid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_WORKING_CALENDAR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getWorkingCalendarsBySpaceID(spaceid);
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

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllSpaces();
            $scope.getAllWorkingCalendars();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { WORKING_CALENDAR: 9 };
        if (tabIndex === TAB_INDEXES.WORKING_CALENDAR && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { WORKING_CALENDAR: 9 };
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.WORKING_CALENDAR && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);

    $scope.refreshSpaceTree = function() {
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceService.getAllSpaces(headers, function (response) {
      if (angular.isDefined(response.status) && response.status === 200) {
        $scope.spaces = response.data;
      } else {
        $scope.spaces = [];
      }
      //create space tree
      var treedata = {'core': {'data': [], "multiple" : false,}, "plugins" : [ "wholerow" ]};
      for(var i=0; i < $scope.spaces.length; i++) {
          if ($scope.spaces[i].id == 1) {
            var node = {"id": $scope.spaces[i].id.toString(),
                                "parent": '#',
                                "text": $scope.spaces[i].name,
                                "state": {  'opened' : true,  'selected' : false },
                               };
          } else {
              var node = {"id": $scope.spaces[i].id.toString(),
                                  "parent": $scope.spaces[i].parent_space.id.toString(),
                                  "text": $scope.spaces[i].name,
                                 };
          };
          treedata['core']['data'].push(node);
      }

      angular.element(spacetreewithworkingcalendar).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithworkingcalendar).jstree(true).refresh();
      // Reset selection state after tree refresh
      $scope.isSpaceSelected = false;
      $scope.spaceworkingcalendars = [];
      if (!$scope.$$phase && !$scope.$root.$$phase) {
          $scope.$apply();
      }
    });
    };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spaceworkingcalendars = [];
    $scope.refreshSpaceTree();
	});

    // Listen for disabled drop events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DROP-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'WORKING_CALENDAR',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { WORKING_CALENDAR: 9 }
        );
    });

    // Listen for disabled drag events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'WORKING_CALENDAR',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { WORKING_CALENDAR: 9 }
        );
    });

});
