'use strict';

app.controller('SpaceCombinedEquipmentController', function($scope,
    $window,
    $translate,
    SpaceService,
    CombinedEquipmentService,
    SpaceCombinedEquipmentService,
    toaster) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.combinedequipments = [];
    $scope.spacecombinedequipments = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingCombineEquipments = false;

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

      angular.element(spacetreewithcombinedequipment).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithcombinedequipment).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.getCombinedEquipmentsBySpaceID($scope.currentSpaceID);
      });
    });
    };

	$scope.getCombinedEquipmentsBySpaceID = function(id) {
	if ($scope.isLoadingCombineEquipments) return;
    $scope.isLoadingCombineEquipments = true;
    $scope.spacecombinedequipments=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceCombinedEquipmentService.getCombinedEquipmentsBySpaceID(id, headers, function (response) {
            $scope.isLoadingCombineEquipments = false;
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.spacecombinedequipments = $scope.spacecombinedequipments.concat(response.data);
            } else {
              $scope.spacecombinedequipments=[];
            }
        });
		};

	$scope.getAllCombinedEquipments = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		CombinedEquipmentService.getAllCombinedEquipments(headers, function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.combinedequipments = response.data;
          } else {
            $scope.combinedequipments = [];
          }
      });
	};

	$scope.pairCombinedEquipment=function(dragEl,dropEl){
		var combinedequipmentid=angular.element('#'+dragEl).scope().combinedequipment.id;
		var spaceid=angular.element(spacetreewithcombinedequipment).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceCombinedEquipmentService.addPair(spaceid,combinedequipmentid, headers, function (response){
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_COMBINED_EQUIPMENT_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getCombinedEquipmentsBySpaceID(spaceid);
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

	$scope.deleteCombinedEquipmentPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spacecombinedequipmentid = angular.element('#' + dragEl).scope().spacecombinedequipment.id;
        var spaceid = angular.element(spacetreewithcombinedequipment).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceCombinedEquipmentService.deletePair(spaceid, spacecombinedequipmentid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_COMBINED_EQUIPMENT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getCombinedEquipmentsBySpaceID(spaceid);
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
	$scope.getAllCombinedEquipments();

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

      angular.element(spacetreewithcombinedequipment).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithcombinedequipment).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacecombinedequipments = [];
    $scope.refreshSpaceTree();
	});
});
