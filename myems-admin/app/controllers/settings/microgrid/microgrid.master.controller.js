'use strict';

app.controller('MicrogridMasterController', function($scope) {


	$scope.$on('handleEmitMicrogridChanged', function(event) {
		$scope.$broadcast('handleBroadcastMicrogridChanged');
	});

});
