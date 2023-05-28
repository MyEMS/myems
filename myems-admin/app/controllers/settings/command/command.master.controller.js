'use strict';

app.controller('CommandMasterController', function($scope) {

	$scope.$on('handleEmitCommandChanged', function(event) {
		$scope.$broadcast('handleBroadcastCommandChanged');
	});

});