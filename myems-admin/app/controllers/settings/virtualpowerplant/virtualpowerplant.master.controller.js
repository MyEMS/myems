'use strict';

app.controller('VirtualPowerPlantMasterController', function($scope) {


	$scope.$on('handleEmitVirtualPowerPlantChanged', function(event) {
		$scope.$broadcast('handleBroadcastVirtualPowerPlantChanged');
	});

});
