'use strict';

app.controller('SpaceStoreController', function($scope,$common ,$timeout, $translate,	SpaceService, StoreService, SpaceStoreService, toaster,SweetAlert) {
  $scope.spaces = [];
  $scope.currentSpaceID = 1;
  $scope.stores = [];
  $scope.spacestores = [];


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

      angular.element(spacetreewithstore).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithstore).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.getStoresBySpaceID($scope.currentSpaceID);
      });
    });
  };

	$scope.getStoresBySpaceID = function(id) {
    $scope.spacestores=[];
    SpaceStoreService.getStoresBySpaceID(id,function(error, data) {
      				if (!error) {
      					$scope.spacestores=$scope.spacestores.concat(data);
      				} else {
                $scope.spacestores=[];
              }
    			});
		};

	$scope.getAllStores = function() {
		StoreService.getAllStores(function(error, data) {
			if (!error) {
				$scope.stores = data;
			} else {
				$scope.stores = [];
			}
		});
	};

	$scope.pairStore=function(dragEl,dropEl){
		var storeid=angular.element('#'+dragEl).scope().store.id;
		var spaceid=angular.element(spacetreewithstore).jstree(true).get_top_selected();
		SpaceStoreService.addPair(spaceid,storeid,function(error,status){
			if (angular.isDefined(status) && status == 201) {
					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = "TOASTER.BIND_STORE_SUCCESS";

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody);

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

					$scope.getStoresBySpaceID(spaceid);
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

	$scope.deleteStorePair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spacestoreid = angular.element('#' + dragEl).scope().spacestore.id;
        var spaceid = angular.element(spacetreewithstore).jstree(true).get_top_selected();

        SpaceStoreService.deletePair(spaceid, spacestoreid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {
                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = "TOASTER.UNBIND_STORE_SUCCESS";

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
                $scope.getStoresBySpaceID(spaceid);
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
	$scope.getAllStores();

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

      angular.element(spacetreewithstore).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithstore).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacestores = [];
    $scope.refreshSpaceTree();
	});

});
