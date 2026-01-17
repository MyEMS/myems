'use strict';

var SHOPFLOOR_TAB_INDEXES = {
    SHOPFLOOR: 0,
    BIND_METER: 1,
    BIND_EQUIPMENT: 2,
    BIND_POINT: 3,
    BIND_SENSOR: 4,
    BIND_WORKING_CALENDAR: 5,
    BIND_COMMAND: 6
};

app.controller('ShopfloorMasterController', function($scope, $timeout) {
    $scope.TAB_INDEXES = SHOPFLOOR_TAB_INDEXES;
    $scope.activeTabIndex = SHOPFLOOR_TAB_INDEXES.SHOPFLOOR;

    $scope.handleTabSelect = function(tabIndex) {
        $scope.activeTabIndex = tabIndex;
        $timeout(function() {
            $scope.$broadcast('shopfloor.tabSelected', tabIndex);
        }, 0);
    };

	$scope.$on('handleEmitShopfloorChanged', function(event) {
		$scope.$broadcast('handleBroadcastShopfloorChanged');
	});
});
