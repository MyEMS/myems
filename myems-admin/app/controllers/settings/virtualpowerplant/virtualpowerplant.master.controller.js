'use strict';

// Virtual Power Plant master controller - coordinates tab events between child controllers

app.controller('VirtualPowerPlantMasterController', function($scope) {


	$scope.$on('handleEmitVirtualPowerPlantChanged', function(event) {
		$scope.$broadcast('handleBroadcastVirtualPowerPlantChanged');
	});

});
