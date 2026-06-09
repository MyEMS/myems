'use strict';

// Store master controller - coordinates tab events between child controllers

var STORE_TAB_INDEXES = {
    STORE: 0,
    BIND_METER: 1,
    BIND_POINT: 2,
    BIND_SENSOR: 3,
    BIND_WORKING_CALENDAR: 4,
    BIND_COMMAND: 5
};

app.controller('StoreMasterController', function($scope, $timeout) {
    $scope.TAB_INDEXES = STORE_TAB_INDEXES;
    $scope.activeTabIndex = STORE_TAB_INDEXES.STORE;

    // Handle tab selection
    $scope.handleTabSelect = function(tabIndex) {
        $scope.activeTabIndex = tabIndex;
        $timeout(function() {
            $scope.$broadcast('store.tabSelected', tabIndex);
        }, 0);
    };

	$scope.$on('handleEmitStoreChanged', function(event) {
		$scope.$broadcast('handleBroadcastStoreChanged');
	});
	
	$scope.$on('handleEmitStoreTypeChanged', function(event) {
		$scope.$broadcast('handleBroadcastStoreTypeChanged');
	});

});
