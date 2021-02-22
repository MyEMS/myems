'use strict';

app.controller('SpaceEquipmentController', function($scope,$common ,$timeout, $translate,	SpaceService, EquipmentService, SpaceEquipmentService, toaster,SweetAlert) {
  $scope.spaces = [];
  $scope.currentSpaceID = 1;
  $scope.equipments = [];
  $scope.spaceequipments = [];


  $scope.getAllSpaces = function() {
    SpaceService.getAllSpaces(function(error, data) {
      if (!error) {
        $scope.spaces = data;
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
    $scope.spaceequipments=[];
    SpaceEquipmentService.getEquipmentsBySpaceID(id,function(error, data) {
      				if (!error) {
      					$scope.spaceequipments=$scope.spaceequipments.concat(data);
      				} else {
                $scope.spaceequipments=[];
              }
    			});
		};

	$scope.getAllEquipments = function() {
		EquipmentService.getAllEquipments(function(error, data) {
			if (!error) {
				$scope.equipments = data;
			} else {
				$scope.equipments = [];
			}
		});
	};

	$scope.pairEquipment=function(dragEl,dropEl){
		var equipmentid=angular.element('#'+dragEl).scope().equipment.id;
		var spaceid=angular.element(spacetreewithequipment).jstree(true).get_top_selected();
		SpaceEquipmentService.addPair(spaceid,equipmentid,function(error,status){
			if (angular.isDefined(status) && status == 201) {
					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = "TOASTER.BIND_EQUIPMENT_SUCCESS";

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody);

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

					$scope.getEquipmentsBySpaceID(spaceid);
				} else {
					var popType = 'TOASTER.ERROR';
          var popTitle = error.title;
          var popBody = error.description;

          popType = $translate.instant(popType);
          popTitle = $translate.instant(popTitle);
          popBody = $translate.instant(popBody);

          toaster.pop({
              type: popType,
              title: popTitle,
              body: popBody,
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

        SpaceEquipmentService.deletePair(spaceid, spaceequipmentid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {
                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = "TOASTER.UNBIND_EQUIPMENT_SUCCESS";

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
                $scope.getEquipmentsBySpaceID(spaceid);
            } else {
                var popType = 'TOASTER.ERROR';
                var popTitle = error.title;
                var popBody = error.description;

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);


                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
            }
		});
	};

  $scope.getAllSpaces();
	$scope.getAllEquipments();

  $scope.refreshSpaceTree = function() {
    SpaceService.getAllSpaces(function(error, data) {
      if (!error) {
        $scope.spaces = data;
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
