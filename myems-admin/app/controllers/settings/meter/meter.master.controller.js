'use strict';

app.controller('MeterMasterController', function($scope) {

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
