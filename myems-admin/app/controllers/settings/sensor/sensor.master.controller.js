'use strict';

var SENSOR_TAB_INDEXES = {
	SENSOR: 0,
	BIND_POINT: 1
};

app.controller('SensorMasterController', function($scope, $timeout) {
	$scope.TAB_INDEXES = SENSOR_TAB_INDEXES;
	$scope.activeTabIndex = SENSOR_TAB_INDEXES.SENSOR;

	$scope.handleTabSelect = function(tabIndex) {
		$scope.activeTabIndex = tabIndex;
		$timeout(function() {
			$scope.$broadcast('sensor.tabSelected', tabIndex);
		}, 0);
	};

	$scope.$on('handleEmitSensorChanged', function(event) {
		$scope.$broadcast('handleBroadcastSensorChanged');
	});

});
