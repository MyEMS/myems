'use strict';

app.controller('SpaceEnergyStoragePowerStationController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    SpaceService,
    EnergyStoragePowerStationService,
    SpaceEnergyStoragePowerStationService,
    toaster,SweetAlert,
    DragDropWarningService) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.energystoragepowerstations = [];
    $scope.spaceenergystoragepowerstations = [];
    $scope.filteredEnergyStoragePowerStations = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingEnergystoragepowerstations = false;
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

      angular.element(spacetreewithenergystoragepowerstation).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithenergystoragepowerstation).on("changed.jstree", function (e, data) {
          if (data.selected && data.selected.length > 0) {
              $scope.currentSpaceID = parseInt(data.selected[0]);
              $scope.isSpaceSelected = true;
              $scope.getEnergyStoragePowerStationsBySpaceID($scope.currentSpaceID);
          } else {
              $scope.isSpaceSelected = false;
              $scope.spaceenergystoragepowerstations = [];
          }
          if (!$scope.$$phase && !$scope.$root.$$phase) {
              $scope.$apply();
          }
      });
    });
    };

	$scope.getEnergyStoragePowerStationsBySpaceID = function(id) {
	if ($scope.isLoadingEnergystoragepowerstations) return;
	$scope.isLoadingEnergystoragepowerstations = true;
    $scope.spaceenergystoragepowerstations=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceEnergyStoragePowerStationService.getEnergyStoragePowerStationsBySpaceID(id, headers, function (response) {
            $scope.isLoadingEnergystoragepowerstations = false;
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.spaceenergystoragepowerstations = response.data;
            } else {
              $scope.spaceenergystoragepowerstations=[];
            }
            $scope.filterAvailableEnergyStoragePowerStations();
        });
		};

	// Filter out energy storage power stations already bound to the current space, keeping only available ones for selection
	$scope.filterAvailableEnergyStoragePowerStations = function() {
        var boundSet = {};
        ($scope.spaceenergystoragepowerstations || []).forEach(function(seps) {
            if (angular.isDefined(seps.id)) {
                boundSet[String(seps.id)] = true;
            }
        });

        $scope.filteredEnergyStoragePowerStations = ($scope.energystoragepowerstations || []).filter(function(eps){
            return !boundSet[String(eps.id)];
        });
    };

	$scope.getAllEnergyStoragePowerStations = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyStoragePowerStationService.getAllEnergyStoragePowerStations(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energystoragepowerstations = response.data;
			} else {
				$scope.energystoragepowerstations = [];
			}
			$scope.filterAvailableEnergyStoragePowerStations();
		});
	};

	$scope.pairEnergyStoragePowerStation=function(dragEl,dropEl){
		var energystoragepowerstationid=angular.element('#'+dragEl).scope().energystoragepowerstation.id;
		var spaceid=angular.element(spacetreewithenergystoragepowerstation).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceEnergyStoragePowerStationService.addPair(spaceid,energystoragepowerstationid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_ENERGY_STORAGE_POWER_STATION_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getEnergyStoragePowerStationsBySpaceID(spaceid);
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

	$scope.deleteEnergyStoragePowerStationPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
    }
    var spaceenergystoragepowerstationid = angular.element('#' + dragEl).scope().spaceenergystoragepowerstation.id;
    var spaceid = angular.element(spacetreewithenergystoragepowerstation).jstree(true).get_top_selected();
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceEnergyStoragePowerStationService.deletePair(spaceid, spaceenergystoragepowerstationid, headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
                type: "success",
                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                body: $translate.instant("TOASTER.UNBIND_ENERGY_STORAGE_POWER_STATION_SUCCESS"),
                showCloseButton: true,
            });
            $scope.getEnergyStoragePowerStationsBySpaceID(spaceid);
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
            $scope.getAllEnergyStoragePowerStations();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.ENERGY_STORAGE_POWER_STATION) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.isSpaceSelected && $scope.currentSpaceID) {
                $scope.getEnergyStoragePowerStationsBySpaceID($scope.currentSpaceID);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.ENERGY_STORAGE_POWER_STATION && !$scope.tabInitialized) {
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

      angular.element(spacetreewithenergystoragepowerstation).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithenergystoragepowerstation).jstree(true).refresh();
      // Reset selection state after tree refresh
      $scope.isSpaceSelected = false;
      $scope.spaceenergystoragepowerstations = [];
      if (!$scope.$$phase && !$scope.$root.$$phase) {
          $scope.$apply();
      }
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
        $scope.spaceenergystoragepowerstations = [];
        $scope.isSpaceSelected = false;
        $scope.currentSpaceID = 1;
        $scope.filterAvailableEnergyStoragePowerStations();
        $scope.refreshSpaceTree();
	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'ENERGY_STORAGE_POWER_STATION',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { ENERGY_STORAGE_POWER_STATION: 13 }
        );
});
