'use strict';

app.controller('SpaceStoreController', function(
    $scope,
    $window,
    $translate,
    SpaceService,
    StoreService, SpaceStoreService, toaster,SweetAlert) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.stores = [];
    $scope.spacestores = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingStores = false;
    $scope.tabInitialized = false;

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

      angular.element(spacetreewithstore).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithstore).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.getStoresBySpaceID($scope.currentSpaceID);
      });
    });
    };

	$scope.getStoresBySpaceID = function(id) {
	if ($scope.isLoadingStores) return;
	$scope.isLoadingStores = true;
    $scope.spacestores=[];
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    SpaceStoreService.getStoresBySpaceID(id, headers, function (response) {
                    $scope.isLoadingStores = false;
      				if (angular.isDefined(response.status) && response.status === 200) {
      					$scope.spacestores = $scope.spacestores.concat(response.data);
      				} else {
                $scope.spacestores=[];
              }
    			});
		};

	$scope.getAllStores = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		StoreService.getAllStores(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.stores = response.data;
			} else {
				$scope.stores = [];
			}
		});
	};

	$scope.pairStore=function(dragEl,dropEl){
		var storeid=angular.element('#'+dragEl).scope().store.id;
		var spaceid=angular.element(spacetreewithstore).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceStoreService.addPair(spaceid,storeid, headers, function (response){
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_STORE_SUCCESS"),
						showCloseButton: true,
					});

					$scope.getStoresBySpaceID(spaceid);
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

	$scope.deleteStorePair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spacestoreid = angular.element('#' + dragEl).scope().spacestore.id;
        var spaceid = angular.element(spacetreewithstore).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceStoreService.deletePair(spaceid, spacestoreid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_STORE_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getStoresBySpaceID(spaceid);
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
            $scope.getAllStores();
        }
    };

    $scope.$on('tabSelected', function(event, tabIndex) {
        if (tabIndex === 7) {
            $scope.initTab();
        }
    });

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

      angular.element(spacetreewithstore).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithstore).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacestores = [];
    $scope.refreshSpaceTree();
	});

});
