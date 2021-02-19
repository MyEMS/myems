'use strict';

app.controller('SpaceTenantController', function($scope,$common ,$timeout, $translate,	SpaceService, TenantService, SpaceTenantService, toaster,SweetAlert) {
  $scope.spaces = [];
  $scope.currentSpaceID = 1;
  $scope.tenants = [];
  $scope.spacetenants = [];


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

      angular.element(spacetreewithtenant).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithtenant).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.getTenantsBySpaceID($scope.currentSpaceID);
      });
    });
  };

	$scope.getTenantsBySpaceID = function(id) {
    $scope.spacetenants=[];
    SpaceTenantService.getTenantsBySpaceID(id,function(error, data) {
      				if (!error) {
      					$scope.spacetenants=$scope.spacetenants.concat(data);
      				} else {
                $scope.spacetenants=[];
              }
    			});
		};

	$scope.getAllTenants = function() {
		TenantService.getAllTenants(function(error, data) {
			if (!error) {
				$scope.tenants = data;
			} else {
				$scope.tenants = [];
			}
		});
	};

	$scope.pairTenant=function(dragEl,dropEl){
		var tenantid=angular.element('#'+dragEl).scope().tenant.id;
		var spaceid=angular.element(spacetreewithtenant).jstree(true).get_top_selected();
		SpaceTenantService.addPair(spaceid,tenantid,function(error,status){
			if (angular.isDefined(status) && status == 201) {
					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = "TOASTER.BIND_TENANT_SUCCESS";

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody);

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

					$scope.getTenantsBySpaceID(spaceid);
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

	$scope.deleteTenantPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spacetenantid = angular.element('#' + dragEl).scope().spacetenant.id;
        var spaceid = angular.element(spacetreewithtenant).jstree(true).get_top_selected();

        SpaceTenantService.deletePair(spaceid, spacetenantid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {
                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = "TOASTER.UNBIND_TENANT_SUCCESS";

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
                $scope.getTenantsBySpaceID(spaceid);
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
	$scope.getAllTenants();

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

      angular.element(spacetreewithtenant).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithtenant).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacetenants = [];
    $scope.refreshSpaceTree();
	});

});
