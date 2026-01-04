'use strict';

var COMBINED_EQUIPMENT_TAB_INDEXES = {
	COMBINED_EQUIPMENT: 0,
	BIND_EQUIPMENT: 1,
	BIND_METER: 2,
	BIND_DATA_SOURCE: 3,
	BIND_PARAMETER: 4,
	BIND_COMMAND: 5
};

app.controller('CombinedEquipmentMasterController', function($scope, $timeout) {
	$scope.TAB_INDEXES = COMBINED_EQUIPMENT_TAB_INDEXES;
	$scope.activeTabIndex = COMBINED_EQUIPMENT_TAB_INDEXES.COMBINED_EQUIPMENT;

	$scope.handleTabSelect = function(tabIndex) {
		$scope.activeTabIndex = tabIndex;
		$timeout(function() {
			$scope.$broadcast('combinedequipment.tabSelected', tabIndex);
		}, 0);
	};

	$scope.$on('handleEmitCombinedEquipmentChanged', function(event) {
		$scope.$broadcast('handleBroadcastCombinedEquipmentChanged');
	});

});
