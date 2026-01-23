'use strict';

app.controller('SpaceEnergyFlowDiagramController', function(
    $scope,
    $window,
    $timeout,
    $translate,
    SpaceService,
    EnergyFlowDiagramService,
    SpaceEnergyFlowDiagramService,
    toaster,SweetAlert,
    DragDropWarningService) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.energyflowdiagrams = [];
    $scope.spaceenergyflowdiagrams = [];
    $scope.filteredEnergyFlowDiagrams = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingEnergyflowdiagrams = false;
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

      angular.element(spacetreewithenergyflowdiagram).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithenergyflowdiagram).on("changed.jstree", function (e, data) {
          if (data.selected && data.selected.length > 0) {
              $scope.currentSpaceID = parseInt(data.selected[0]);
              $scope.isSpaceSelected = true;
              $scope.getEnergyFlowDiagramsBySpaceID($scope.currentSpaceID);
          } else {
              $scope.isSpaceSelected = false;
              $scope.spaceenergyflowdiagrams = [];
          }
          if (!$scope.$$phase && !$scope.$root.$$phase) {
              $scope.$apply();
          }
      });
    });
    };

	$scope.getEnergyFlowDiagramsBySpaceID = function(id) {
	if ($scope.isLoadingEnergyflowdiagrams) return;
	$scope.isLoadingEnergyflowdiagrams = true;
    $scope.spaceenergyflowdiagrams=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceEnergyFlowDiagramService.getEnergyFlowDiagramsBySpaceID(id, headers, function (response) {
            $scope.isLoadingEnergyflowdiagrams = false;
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.spaceenergyflowdiagrams = response.data;
            } else {
              $scope.spaceenergyflowdiagrams=[];
            }
            $scope.filterAvailableEnergyFlowDiagrams();
        });
		};

	// Filter out energy flow diagrams that are already bound to the current space,
	// keeping only available energy flow diagrams for selection
	$scope.filterAvailableEnergyFlowDiagrams = function() {
        var boundSet = {};
        ($scope.spaceenergyflowdiagrams || []).forEach(function(sefd) {
            if (angular.isDefined(sefd.id)) {
                boundSet[String(sefd.id)] = true;
            }
        });

        $scope.filteredEnergyFlowDiagrams = ($scope.energyflowdiagrams || []).filter(function(efd){
            return !boundSet[String(efd.id)];
        });
    };

	$scope.getAllEnergyFlowDiagrams = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyFlowDiagramService.getAllEnergyFlowDiagrams(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.energyflowdiagrams = response.data;
			} else {
				$scope.energyflowdiagrams = [];
			}
			$scope.filterAvailableEnergyFlowDiagrams();
		});
	};

	$scope.pairEnergyFlowDiagram=function(dragEl,dropEl){
		var energyflowdiagramid=angular.element('#'+dragEl).scope().energyflowdiagram.id;
		var spaceid=angular.element(spacetreewithenergyflowdiagram).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceEnergyFlowDiagramService.addPair(spaceid,energyflowdiagramid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_ENERGYFLOWDIAGRAM_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getEnergyFlowDiagramsBySpaceID(spaceid);
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

	$scope.deleteEnergyFlowDiagramPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spaceenergyflowdiagramid = angular.element('#' + dragEl).scope().spaceenergyflowdiagram.id;
        var spaceid = angular.element(spacetreewithenergyflowdiagram).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceEnergyFlowDiagramService.deletePair(spaceid, spaceenergyflowdiagramid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_ENERGYFLOWDIAGRAM_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getEnergyFlowDiagramsBySpaceID(spaceid);
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
            $scope.getAllEnergyFlowDiagrams();
        }
    };

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.ENERGY_FLOW_DIAGRAM) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.isSpaceSelected && $scope.currentSpaceID) {
                $scope.getEnergyFlowDiagramsBySpaceID($scope.currentSpaceID);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.ENERGY_FLOW_DIAGRAM && !$scope.tabInitialized) {
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

      angular.element(spacetreewithenergyflowdiagram).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithenergyflowdiagram).jstree(true).refresh();
      // Reset selection state after tree refresh
      $scope.isSpaceSelected = false;
      $scope.spaceenergyflowdiagrams = [];
      if (!$scope.$$phase && !$scope.$root.$$phase) {
          $scope.$apply();
      }
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
        $scope.spaceenergyflowdiagrams = [];
        $scope.isSpaceSelected = false;
        $scope.currentSpaceID = 1;
        $scope.filterAvailableEnergyFlowDiagrams();
        $scope.refreshSpaceTree();
	});

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'ENERGY_FLOW_DIAGRAM',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { ENERGY_FLOW_DIAGRAM: 9 }
        );
});
