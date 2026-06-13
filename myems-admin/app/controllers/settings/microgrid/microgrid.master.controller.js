'use strict';

// Microgrid master controller - coordinates tab events between child controllers

app.controller('MicrogridMasterController', function($scope) {


	$scope.$on('handleEmitMicrogridChanged', function(event) {
		$scope.$broadcast('handleBroadcastMicrogridChanged');
	});

});
