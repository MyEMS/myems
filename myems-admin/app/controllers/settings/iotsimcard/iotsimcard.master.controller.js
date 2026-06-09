'use strict';

// IoT SIM Card master controller - coordinates tab events between child controllers

app.controller('IoTSIMCardMasterController', function($scope) {

	$scope.$on('handleEmitIoTSIMCardChanged', function(event) {
		$scope.$broadcast('handleBroadcastIoTSIMCardChanged');
	});

});
