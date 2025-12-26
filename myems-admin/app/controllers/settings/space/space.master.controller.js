'use strict';

var SPACE_TAB_INDEXES = {
	SPACE: 0,
	METER: 1,
	EQUIPMENT: 2,
	COMBINED_EQUIPMENT: 3,
	POINT: 4,
	SENSOR: 5,
	TENANT: 6,
	STORE: 7,
	SHOPFLOOR: 8,
	WORKING_CALENDAR: 9,
	COMMAND: 10,
	ENERGY_STORAGE_POWER_STATION: 11,
	ENERGY_FLOW_DIAGRAM: 12,
	DISTRIBUTION_SYSTEM: 13,
	PHOTOVOLTAIC_POWER_STATION: 14,
	MICROGRID: 15
};

app.controller('SpaceMasterController', function($scope, $timeout) {
	$scope.TAB_INDEXES = SPACE_TAB_INDEXES;
	$scope.activeTabIndex = SPACE_TAB_INDEXES.SPACE;

	$scope.handleTabSelect = function(tabIndex) {
		$scope.activeTabIndex = tabIndex;
		$timeout(function() {
			$scope.$broadcast('space.tabSelected', tabIndex);
		}, 0);
	};


	$scope.$on('handleEmitSpaceChanged', function(event) {
		$scope.$broadcast('handleBroadcastSpaceChanged');
	});
});
