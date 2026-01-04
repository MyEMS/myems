'use strict';

var EQUIPMENT_TAB_INDEXES = {
	EQUIPMENT: 0,
	BIND_METER: 1,
	BIND_DATA_SOURCE: 2,
	BIND_PARAMETER: 3,
	BIND_COMMAND: 4
};

app.controller('EquipmentMasterController', function($scope, $timeout) {
	$scope.TAB_INDEXES = EQUIPMENT_TAB_INDEXES;
	$scope.activeTabIndex = EQUIPMENT_TAB_INDEXES.EQUIPMENT;

	$scope.handleTabSelect = function(tabIndex) {
		$scope.activeTabIndex = tabIndex;
		$timeout(function() {
			$scope.$broadcast('equipment.tabSelected', tabIndex);
		}, 0);
	};

	$scope.$on('handleEmitEquipmentChanged', function(event) {
		$scope.$broadcast('handleBroadcastEquipmentChanged');
	});

});
