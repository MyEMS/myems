'use strict';

app.controller('SpaceMeterController', function(
    $scope ,
    $window,
    $timeout,
    $translate,
    $q,
    SpaceService,
    MeterService,
    VirtualMeterService,
    OfflineMeterService, 
    SpaceMeterService, 
    toaster,
    SweetAlert,
    DragDropWarningService) {
    $scope.spaces = [];
    $scope.currentSpaceID = 1;
    $scope.spacemeters = [];
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isLoadingMeters = false;
    $scope.tabInitialized = false;
    $scope.isSpaceSelected = false;
    $scope.currentmeters = [];
    $scope.meters = [];
    $scope.virtualmeters = [];
    $scope.offlinemeters = [];
    $scope.filteredMeters = [];
    $scope.filteredVirtualMeters = [];
    $scope.filteredOfflineMeters = [];

    function safeApply(scope) {
        if (!scope.$$phase && !scope.$root.$$phase) {
            scope.$apply();
        }
    }

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

      angular.element(spacetreewithmeter).jstree(treedata);
      //space tree selected changed event handler
      angular.element(spacetreewithmeter).on("changed.jstree", function (e, data) {
          if (data.selected && data.selected.length > 0) {
          $scope.currentSpaceID = parseInt(data.selected[0]);
              $scope.isSpaceSelected = true;
          $scope.spacemeters=[];
          $scope.getMetersBySpaceID($scope.currentSpaceID);
          } else {
              $scope.isSpaceSelected = false;
              $scope.spacemeters = [];
          }
          safeApply($scope);
      });
    });
    };

	$scope.getMetersBySpaceID = function(id) {
	    if ($scope.isLoadingMeters) return;
	    $scope.isLoadingMeters = true;
	    var metertypes = ['meters', 'virtualmeters', 'offlinemeters'];
	    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        var promises = metertypes.map(function(value) {
            var deferred = $q.defer();
            SpaceMeterService.getMetersBySpaceID(id, value, headers, function(response) {
                if (angular.isDefined(response.status) && response.status === 200) {
                    angular.forEach(response.data, function(item, indx) {
                        response.data[indx].metertype = value;
                    });
                    deferred.resolve(response.data);
                } else {
                    deferred.reject(new Error('Failed to load meters for space: ' + value));
                }
            });
            return deferred.promise;
        });

        $q.all(promises).then(function(results) {
            $scope.spacemeters = [].concat.apply([], results);
            $scope.isLoadingMeters = false;
            $scope.filterAvailableMeters();
        }).catch(function(error) {
            console.error('Error loading meters:', error);
            $scope.spacemeters = [];
            $scope.isLoadingMeters = false;
            $scope.filterAvailableMeters();
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

	// Filter out meters that are already bound to the current space,
	// keeping only available meters for selection
	$scope.filterAvailableMeters = function() {
		var boundSet = {};
		($scope.spacemeters || []).forEach(function(sm) {
			var keyType = sm.metertype || 'meters';
			if (angular.isDefined(sm.id)) {
				boundSet[keyType + '_' + String(sm.id)] = true;
			}
		});

		$scope.filteredMeters = ($scope.meters || []).filter(function(m){
			return !boundSet['meters_' + String(m.id)];
		});
		$scope.filteredVirtualMeters = ($scope.virtualmeters || []).filter(function(vm){
			return !boundSet['virtualmeters_' + String(vm.id)];
		});
		$scope.filteredOfflineMeters = ($scope.offlinemeters || []).filter(function(om){
			return !boundSet['offlinemeters_' + String(om.id)];
		});

		$scope.changeMeterType();
	};

	$scope.changeMeterType=function(){
		// Defensive assignment to prevent race conditions
		$scope.filteredMeters = $scope.filteredMeters || [];
		$scope.filteredVirtualMeters = $scope.filteredVirtualMeters || [];
		$scope.filteredOfflineMeters = $scope.filteredOfflineMeters || [];
		
		switch($scope.currentMeterType){
			case 'meters':
				$scope.currentmeters=$scope.filteredMeters;
				break;
			case 'virtualmeters':
				$scope.currentmeters=$scope.filteredVirtualMeters;
				break;
			case  'offlinemeters':
				$scope.currentmeters=$scope.filteredOfflineMeters;
				break;
			default:
				$scope.currentmeters = [];
		}
	};

	$scope.getAllMeters = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				$scope.currentMeterType="meters";
				$scope.filterAvailableMeters();
			} else {
				$scope.meters = [];
				$scope.filterAvailableMeters();
			}
		});

	};

	$scope.getAllOfflineMeters = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		OfflineMeterService.getAllOfflineMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeters = response.data;
			} else {
				$scope.offlinemeters = [];
			}
			$scope.filterAvailableMeters();
		});

	};

	$scope.getAllVirtualMeters = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		VirtualMeterService.getAllVirtualMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.virtualmeters = response.data;
			} else {
				$scope.virtualmeters = [];
			}
			$scope.filterAvailableMeters();
		});

	};

	$scope.pairMeter=function(dragEl,dropEl){
		if (!$scope.isSpaceSelected) {
			DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_SPACE_FIRST");
			return;
		}
		var meterid=angular.element('#'+dragEl).scope().meter.id;
		var spaceid=angular.element(spacetreewithmeter).jstree(true).get_top_selected();
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SpaceMeterService.addPair(spaceid,meterid, $scope.currentMeterType, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_METER_SUCCESS"),
						showCloseButton: true,
					});
					$scope.getMetersBySpaceID(spaceid);
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

	$scope.deleteMeterPair=function(dragEl,dropEl){
		if(angular.element('#'+dragEl).hasClass('source')){
			return;
        }
		if (!$scope.isSpaceSelected) {
			DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_SPACE_FIRST");
			return;
		}
        var spacemeterid = angular.element('#' + dragEl).scope().spacemeter.id;
        var spaceid = angular.element(spacetreewithmeter).jstree(true).get_top_selected();
        var metertype = angular.element('#' + dragEl).scope().spacemeter.metertype;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SpaceMeterService.deletePair(spaceid, spacemeterid, metertype, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_METER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMetersBySpaceID(spaceid);
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
            $scope.getAllMeters();
            $scope.getAllVirtualMeters();
            $scope.getAllOfflineMeters();
        }
    };

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
            $scope,
            'METER',
            'SETTING.PLEASE_SELECT_SPACE_FIRST',
            { METER: 1 }
        );

    $scope.$on('space.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.METER) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.isSpaceSelected && $scope.currentSpaceID) {
                $scope.getMetersBySpaceID($scope.currentSpaceID);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.METER && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);

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

      angular.element(spacetreewithmeter).jstree(true).settings.core.data = treedata['core']['data'];
      angular.element(spacetreewithmeter).jstree(true).refresh();
      // Reset selection state after tree refresh
      $scope.isSpaceSelected = false;
      $scope.spacemeters = [];
      safeApply($scope);
    });
    };

	$scope.$on('handleBroadcastSpaceChanged', function(event) {
        $scope.spacemeters = [];
        $scope.isSpaceSelected = false;
        $scope.currentSpaceID = 1;
        $scope.filterAvailableMeters();
        $scope.refreshSpaceTree();
	});

});
