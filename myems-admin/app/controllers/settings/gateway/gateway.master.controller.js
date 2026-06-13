'use strict';

// Gateway master controller - coordinates tab events between child controllers

app.controller('GatewayMasterController', function($scope) {

	$scope.$on('handleEmitGatewayChanged', function(event) {
		$scope.$broadcast('handleBroadcastGatewayChanged');
	});

});
