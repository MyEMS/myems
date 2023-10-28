'use strict';

app.controller('PhotovoltaicPowerStationMasterController', function($scope) {


	$scope.$on('handleEmitPhotovoltaicPowerStationChanged', function(event) {
		$scope.$broadcast('handleBroadcastPhotovoltaicPowerStationChanged');
	});

});
