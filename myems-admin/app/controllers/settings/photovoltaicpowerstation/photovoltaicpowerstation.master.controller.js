'use strict';

// Photovoltaic Power Station master controller - coordinates tab events between child controllers

app.controller('PhotovoltaicPowerStationMasterController', function($scope) {


	$scope.$on('handleEmitPhotovoltaicPowerStationChanged', function(event) {
		$scope.$broadcast('handleBroadcastPhotovoltaicPowerStationChanged');
	});

});
