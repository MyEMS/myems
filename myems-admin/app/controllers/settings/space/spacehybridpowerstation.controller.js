'use strict';

app.controller('SpaceHybridPowerStationController', function(
    $scope,
    $window,
    $translate,
    SpaceService,
    HybridPowerStationService,
    SpaceHybridPowerStationService,
    toaster,SweetAlert) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.hybridpowerstations = [];
    $scope.spacehybridpowerstations = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

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

      angular.element(spacetreewithhybridpowerstation).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithhybridpowerstation).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.getHybridPowerStationsBySpaceID($scope.currentSpaceID);
      });
    });
    };

	$scope.getHybridPowerStationsBySpaceID = function(id) {
    $scope.spacehybridpowerstations=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceHybridPowerStationService.getHybridPowerStationsBySpaceID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.spacehybridpowerstations = $scope.spacehybridpowerstations.concat(response.data);
            } else {
              $scope.spacehybridpowerstations=[];
            }
        });
		};

	$scope.getAllHybridPowerStations = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		HybridPowerStationService.getAllHybridPowerStations(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.hybridpowerstations = response.data;
			} else {
				$scope.hybridpowerstations = [];
			}
		});
	};

	$scope.pairHybridPowerStation=function(dragEl,dropEl){
		var hybridpowerstationid=angular.element('#'+dragEl).scope().hybridpowerstation.id;
		var spaceid=angular.element(spacetreewithhybridpowerstation).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceHybridPowerStationService.addPair(spaceid,hybridpowerstationid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_HYBRID_POWER_STATION_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getHybridPowerStationsBySpaceID(spaceid);
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

	$scope.deleteHybridPowerStationPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
    }
    var spacehybridpowerstationid = angular.element('#' + dragEl).scope().spacehybridpowerstation.id;
    var spaceid = angular.element(spacetreewithhybridpowerstation).jstree(true).get_top_selected();
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceHybridPowerStationService.deletePair(spaceid, spacehybridpowerstationid, headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
                type: "success",
                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                body: $translate.instant("TOASTER.UNBIND_HYBRID_POWER_STATION_SUCCESS"),
                showCloseButton: true,
            });
            $scope.getHybridPowerStationsBySpaceID(spaceid);
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

  $scope.getAllSpaces();
	$scope.getAllHybridPowerStations();

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

      angular.element(spacetreewithhybridpowerstation).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithhybridpowerstation).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacehybridpowerstations = [];
    $scope.refreshSpaceTree();
	});
});
