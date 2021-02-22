'use strict';

app.controller('SpaceShopfloorController', function($scope,$common ,$timeout, $translate,	SpaceService, ShopfloorService, SpaceShopfloorService, toaster,SweetAlert) {
  $scope.spaces = [];
  $scope.currentSpaceID = 1;
  $scope.shopfloors = [];
  $scope.spaceshopfloors = [];


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

      angular.element(spacetreewithshopfloor).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithshopfloor).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.getShopfloorsBySpaceID($scope.currentSpaceID);
      });
    });
  };

	$scope.getShopfloorsBySpaceID = function(id) {
    $scope.spaceshopfloors=[];
    SpaceShopfloorService.getShopfloorsBySpaceID(id,function(error, data) {
      				if (!error) {
      					$scope.spaceshopfloors=$scope.spaceshopfloors.concat(data);
      				} else {
                $scope.spaceshopfloors=[];
              }
    			});
		};

	$scope.getAllShopfloors = function() {
		ShopfloorService.getAllShopfloors(function(error, data) {
			if (!error) {
				$scope.shopfloors = data;
			} else {
				$scope.shopfloors = [];
			}
		});
	};

	$scope.pairShopfloor=function(dragEl,dropEl){
		var shopfloorid=angular.element('#'+dragEl).scope().shopfloor.id;
		var spaceid=angular.element(spacetreewithshopfloor).jstree(true).get_top_selected();
		SpaceShopfloorService.addPair(spaceid,shopfloorid,function(error,status){
			if (angular.isDefined(status) && status == 201) {
					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = "TOASTER.BIND_SHOPFLOOR_SUCCESS";

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody);

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

					$scope.getShopfloorsBySpaceID(spaceid);
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

	$scope.deleteShopfloorPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spaceshopfloorid = angular.element('#' + dragEl).scope().spaceshopfloor.id;
        var spaceid = angular.element(spacetreewithshopfloor).jstree(true).get_top_selected();

        SpaceShopfloorService.deletePair(spaceid, spaceshopfloorid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {
                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = "TOASTER.UNBIND_SHOPFLOOR_SUCCESS";

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
                $scope.getShopfloorsBySpaceID(spaceid);
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
	$scope.getAllShopfloors();

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

      angular.element(spacetreewithshopfloor).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithshopfloor).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spaceshopfloors = [];
    $scope.refreshSpaceTree();
	});

});
