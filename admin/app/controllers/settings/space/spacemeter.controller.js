'use strict';

app.controller('SpaceMeterController', function($scope,$common ,$timeout, $translate,	SpaceService, MeterService, VirtualMeterService, OfflineMeterService, SpaceMeterService, toaster,SweetAlert) {
  $scope.spaces = [];
  $scope.currentSpaceID = 1;
	$scope.spacemeters = [];

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

      angular.element(spacetreewithmeter).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithmeter).on("changed.jstree", function (e, data) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
          $scope.spacemeters=[];
          $scope.getMetersBySpaceID($scope.currentSpaceID);
      });
    });
  };

	$scope.getMetersBySpaceID = function(id) {
		var metertypes=['meters','virtualmeters','offlinemeters'];
		$scope.spacemeters=[];
		angular.forEach(metertypes,function(value,index){
          console.log(id, value, index);
    			SpaceMeterService.getMetersBySpaceID(id,value,function(error, data) {
        				if (!error) {
        					angular.forEach(data, function(item,indx) {data[indx].metertype=value;});
        					$scope.spacemeters=$scope.spacemeters.concat(data);
                  console.log($scope.spacemeters);
        				}
    			});
		});
	};

	$scope.colorMeterType=function(type){
		if(type=='meters'){
			return 'btn-primary'
		}else if(type=='virtualmeters'){
			return 'btn-info'
		}else{
			return 'btn-success'
		}
	};

	$scope.changeMeterType=function(){
		switch($scope.currentMeterType){
			case 'meters':
				$scope.currentmeters=$scope.meters;
				break;
			case 'virtualmeters':
				$scope.currentmeters=$scope.virtualmeters;
				break;
			case  'offlinemeters':
				$scope.currentmeters=$scope.offlinemeters;
				break;
		}
	};

	$scope.getAllMeters = function() {
		MeterService.getAllMeters(function(error, data) {
			if (!error) {
				$scope.meters = data;
				$scope.currentMeterType="meters";
				$timeout(function(){
					$scope.changeMeterType();
				},1000);
			} else {
				$scope.meters = [];
			}
		});

	};

	$scope.getAllOfflineMeters = function() {
		OfflineMeterService.getAllOfflineMeters(function(error, data) {
			if (!error) {
				$scope.offlinemeters = data;
			} else {
				$scope.offlinemeters = [];
			}
		});

	};

	$scope.getAllVirtualMeters = function() {
		VirtualMeterService.getAllVirtualMeters(function(error, data) {
			if (!error) {
				$scope.virtualmeters = data;
			} else {
				$scope.virtualmeters = [];
			}
		});

	};

	$scope.pairMeter=function(dragEl,dropEl){
		var meterid=angular.element('#'+dragEl).scope().meter.id;
		var spaceid=angular.element(spacetreewithmeter).jstree(true).get_top_selected();
		SpaceMeterService.addPair(spaceid,meterid, $scope.currentMeterType,function(error,status){
			if (angular.isDefined(status) && status == 201) {
					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = "TOASTER.BIND_METER_SUCCESS";

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody);

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

					$scope.getMetersBySpaceID(spaceid);
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

	$scope.deleteMeterPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
        var spacemeterid = angular.element('#' + dragEl).scope().spacemeter.id;
        var spaceid = angular.element(spacetreewithmeter).jstree(true).get_top_selected();
        var metertype = angular.element('#' + dragEl).scope().spacemeter.metertype;
        SpaceMeterService.deletePair(spaceid, spacemeterid, metertype, function (error, status) {
            if (angular.isDefined(status) && status == 204) {
                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = "TOASTER.UNBIND_METER_SUCCESS";

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });
                $scope.getMetersBySpaceID(spaceid);
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
	$scope.getAllMeters();
	$scope.getAllVirtualMeters();
	$scope.getAllOfflineMeters();

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

      angular.element(spacetreewithmeter).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithmeter).jstree(true).refresh();
    });
  };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
    $scope.spacemeters = [];
    $scope.refreshSpaceTree();
	});

});
