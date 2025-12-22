'use strict';

app.controller('SpaceMasterController', function($scope) {
	var TAB_INDEXES = {
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

	$scope.activeTabIndex = 0;
	$scope.initializedTabs = {};
	$scope.TAB_INDEXES = TAB_INDEXES;

	$scope.initializedTabs[TAB_INDEXES.SPACE] = true;

	$scope.$watch('activeTabIndex', function(newIndex, oldIndex) {
		if (newIndex !== oldIndex && newIndex !== undefined) {
			if (!$scope.initializedTabs[newIndex]) {
				$scope.$broadcast('space.tabSelected', newIndex);
				$scope.initializedTabs[newIndex] = true;
			}
		}
	});

	$scope.$on('handleEmitSpaceChanged', function(event) {
		$scope.$broadcast('handleBroadcastSpaceChanged');
	});
});
