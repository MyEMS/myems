'use strict';

app.controller('SpaceCombinedEquipmentController', function($scope,$common ,$timeout, $translate,	SpaceService, CombinedEquipmentService, SpaceCombinedEquipmentService, toaster,SweetAlert) {
  $scope.spaces = [];
  $scope.currentSpaceID = 1;
  $scope.combinedequipments = [];
  $scope.spacecombinedequipments = [];


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

      angular.element(spacetreewithcombinedequipment).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithcombinedequipment).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.getCombinedEquipmentsBySpaceID($scope.currentSpaceID);
      });
    });
  };

	$scope.getCombinedEquipmentsBySpaceID = function(id) {
    $scope.spacecombinedequipments=[];
    SpaceCombinedEquipmentService.getCombinedEquipmentsBySpaceID(id,function(error, data) {
      				if (!error) {
      					$scope.spacecombinedequipments=$scope.spacecombinedequipments.concat(data);
      				} else {
                $scope.spacecombinedequipments=[];
              }
    			});
		};

	$scope.getAllCombinedEquipments = function() {
		CombinedEquipmentService.getAllCombinedEquipments(function(error, data) {
			if (!error) {
				$scope.combinedequipments = data;
			} else {
				$scope.combinedequipments = [];
			}
		});
	};

	$scope.pairCombinedEquipment=function(dragEl,dropEl){
		var combinedequipmentid=angular.element('#'+dragEl).scope().combinedequipment.id;
		var spaceid=angular.element(spacetreewithcombinedequipment).jstree(true).get_top_selected();
		SpaceCombinedEquipmentService.addPair(spaceid,combinedequipmentid,function(error,status){
			if (angular.isDefined(status) && status == 201) {
					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = "TOASTER.BIND_COMBINED_EQUIPMENT_SUCCESS";

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody);

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

					$scope.getCombinedEquipmentsBySpaceID(spaceid);
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

	$scope.deleteCombinedEquipmentPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spacecombinedequipmentid = angular.element('#' + dragEl).scope().spacecombinedequipment.id;
        var spaceid = angular.element(spacetreewithcombinedequipment).jstree(true).get_top_selected();

        SpaceCombinedEquipmentService.deletePair(spaceid, spacecombinedequipmentid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {
                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = "TOASTER.UNBIND_COMBINED_EQUIPMENT_SUCCESS";

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
                $scope.getCombinedEquipmentsBySpaceID(spaceid);
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
	$scope.getAllCombinedEquipments();

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

      angular.element(spacetreewithcombinedequipment).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithcombinedequipment).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacecombinedequipments = [];
    $scope.refreshSpaceTree();
	});
});
