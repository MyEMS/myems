'use strict';

app.controller('SpaceEquipmentController', function(
    $scope,
    $window,
    $translate,
    SpaceService,
    EquipmentService,
    SpaceEquipmentService,
    toaster,SweetAlert) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.equipments = [];
    $scope.spaceequipments = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingEquipments = false;

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

      angular.element(spacetreewithequipment).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithequipment).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.getEquipmentsBySpaceID($scope.currentSpaceID);
      });
    });
    };

	$scope.getEquipmentsBySpaceID = function(id) {
	if ($scope.isLoadingEquipments) return;
    $scope.isLoadingEquipments = true;
    $scope.spaceequipments=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceEquipmentService.getEquipmentsBySpaceID(id, headers, function (response) {
            $scope.isLoadingEquipments = false;
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.spaceequipments = $scope.spaceequipments.concat(response.data);
            } else {
              $scope.spaceequipments=[];
            }
        });
		};

	$scope.getAllEquipments = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EquipmentService.getAllEquipments(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.equipments = response.data;
			} else {
				$scope.equipments = [];
			}
		});
	};

	$scope.pairEquipment=function(dragEl,dropEl){
		var equipmentid=angular.element('#'+dragEl).scope().equipment.id;
		var spaceid=angular.element(spacetreewithequipment).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceEquipmentService.addPair(spaceid,equipmentid, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_EQUIPMENT_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getEquipmentsBySpaceID(spaceid);
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

	$scope.deleteEquipmentPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spaceequipmentid = angular.element('#' + dragEl).scope().spaceequipment.id;
        var spaceid = angular.element(spacetreewithequipment).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceEquipmentService.deletePair(spaceid, spaceequipmentid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_EQUIPMENT_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getEquipmentsBySpaceID(spaceid);
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
	$scope.getAllEquipments();

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

      angular.element(spacetreewithequipment).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithequipment).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spaceequipments = [];
    $scope.refreshSpaceTree();
	});
});
