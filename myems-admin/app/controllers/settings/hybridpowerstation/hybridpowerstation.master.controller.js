'use strict';

app.controller('HybridPowerStationMasterController', function($scope) {


	$scope.$on('handleEmitHybridPowerStationChanged', function(event) {
		$scope.$broadcast('handleBroadcastHybridPowerStationChanged');
	});

});
