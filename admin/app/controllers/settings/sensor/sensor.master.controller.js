'use strict';

app.controller('SensorMasterController', function($scope) {


	$scope.$on('handleEmitSensorChanged', function(event) {
		$scope.$broadcast('handleBroadcastSensorChanged');
	});

});
