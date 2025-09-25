'use strict';

app.controller('IoTSIMCardMasterController', function($scope) {

	$scope.$on('handleEmitIoTSIMCardChanged', function(event) {
		$scope.$broadcast('handleBroadcastIoTSIMCardChanged');
	});

});
