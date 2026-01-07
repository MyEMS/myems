'use strict';

app.controller('SpacePhotovoltaicPowerStationController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    SpaceService,
    PhotovoltaicPowerStationService,
    SpacePhotovoltaicPowerStationService,
    toaster,SweetAlert,
    DragDropWarningService) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.photovoltaicpowerstations = [];
    $scope.spacephotovoltaicpowerstations = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingPhotovoltaicpowerstations = false;
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

      angular.element(spacetreewithphotovoltaicpowerstation).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithphotovoltaicpowerstation).on("changed.jstree", function (e, data) {
          if (data.selected && data.selected.length > 0) {
              $scope.currentSpaceID = parseInt(data.selected[0]);
              $scope.isSpaceSelected = true;
              $scope.getPhotovoltaicPowerStationsBySpaceID($scope.currentSpaceID);
          } else {
              $scope.isSpaceSelected = false;
              $scope.spacephotovoltaicpowerstations = [];
          }
          if (!$scope.$$phase && !$scope.$root.$$phase) {
              $scope.$apply();
          }
      });
    });
    };

	$scope.getPhotovoltaicPowerStationsBySpaceID = function(id) {
	if ($scope.isLoadingPhotovoltaicpowerstations) return;
	$scope.isLoadingPhotovoltaicpowerstations = true;
    $scope.spacephotovoltaicpowerstations=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpacePhotovoltaicPowerStationService.getPhotovoltaicPowerStationsBySpaceID(id, headers, function (response) {
            $scope.isLoadingPhotovoltaicpowerstations = false;
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.spacephotovoltaicpowerstations = response.data;
            } else {
              $scope.spacephotovoltaicpowerstations=[];
            }
        });
		};

	$scope.getAllPhotovoltaicPowerStations = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		PhotovoltaicPowerStationService.getAllPhotovoltaicPowerStations(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.photovoltaicpowerstations = response.data;
			} else {
				$scope.photovoltaicpowerstations = [];
			}
		});
	};

	$scope.pairPhotovoltaicPowerStation=function(dragEl,dropEl){
		var photovoltaicpowerstationid=angular.element('#'+dragEl).scope().photovoltaicpowerstation.id;
		var spaceid=angular.element(spacetreewithphotovoltaicpowerstation).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpacePhotovoltaicPowerStationService.addPair(spaceid,photovoltaicpowerstationid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_PHOTOVOLTAIC_POWER_STATION_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getPhotovoltaicPowerStationsBySpaceID(spaceid);
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

	$scope.deletePhotovoltaicPowerStationPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
    }
    var spacephotovoltaicpowerstationid = angular.element('#' + dragEl).scope().spacephotovoltaicpowerstation.id;
    var spaceid = angular.element(spacetreewithphotovoltaicpowerstation).jstree(true).get_top_selected();
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpacePhotovoltaicPowerStationService.deletePair(spaceid, spacephotovoltaicpowerstationid, headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
                type: "success",
                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                body: $translate.instant("TOASTER.UNBIND_PHOTOVOLTAIC_POWER_STATION_SUCCESS"),
                showCloseButton: true,
            });
            $scope.getPhotovoltaicPowerStationsBySpaceID(spaceid);
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
            $scope.getAllPhotovoltaicPowerStations();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { PHOTOVOLTAIC_POWER_STATION: 14 };
        if (tabIndex === TAB_INDEXES.PHOTOVOLTAIC_POWER_STATION && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { PHOTOVOLTAIC_POWER_STATION: 14 };
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.PHOTOVOLTAIC_POWER_STATION && !$scope.tabInitialized) {
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

      angular.element(spacetreewithphotovoltaicpowerstation).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithphotovoltaicpowerstation).jstree(true).refresh();
      // Reset selection state after tree refresh
      $scope.isSpaceSelected = false;
      $scope.spacephotovoltaicpowerstations = [];
      if (!$scope.$$phase && !$scope.$root.$$phase) {
          $scope.$apply();
      }
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacephotovoltaicpowerstations = [];
    $scope.refreshSpaceTree();
	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
        $scope,
        'PHOTOVOLTAIC_POWER_STATION',
        'SETTING.PLEASE_SELECT_SPACE_FIRST',
        { PHOTOVOLTAIC_POWER_STATION: 14 }
    );
});
