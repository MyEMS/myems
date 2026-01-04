'use strict';

var METER_TAB_INDEXES = {
	METER: 0,
	BIND_POINT: 1,
	TREE_VIEW: 2,
	VIRTUAL_METER: 3,
	OFFLINE_METER: 4,
	OFFLINE_METER_FILE: 5,
	BIND_COMMAND: 6
};

app.controller('MeterMasterController', function($scope, $timeout) {
	$scope.TAB_INDEXES = METER_TAB_INDEXES;
	$scope.activeTabIndex = METER_TAB_INDEXES.METER;

	$scope.handleTabSelect = function(tabIndex) {
		$scope.activeTabIndex = tabIndex;
		$timeout(function() {
			$scope.$broadcast('meter.tabSelected', tabIndex);
		}, 0);
	};

	$scope.$on('handleEmitMeterChanged', function(event) {
		$scope.$broadcast('handleBroadcastMeterChanged');
	});

	$scope.$on('handleEmitOfflineMeterChanged', function(event) {
		$scope.$broadcast('handleBroadcastOfflineMeterChanged');
	});

	$scope.$on('handleEmitVirtualMeterChanged', function(event) {
		$scope.$broadcast('handleBroadcastVirtualMeterChanged');
	});

});
