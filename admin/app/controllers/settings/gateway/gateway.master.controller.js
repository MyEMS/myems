'use strict';

app.controller('GatewayMasterController', function($scope) {

	$scope.$on('handleEmitGatewayChanged', function(event) {
		$scope.$broadcast('handleBroadcastGatewayChanged');
	});

});
