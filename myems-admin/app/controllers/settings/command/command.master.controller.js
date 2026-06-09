'use strict';

// Command master controller - coordinates tab events between child controllers

app.controller('CommandMasterController', function($scope) {

	$scope.$on('handleEmitCommandChanged', function(event) {
		$scope.$broadcast('handleBroadcastCommandChanged');
	});

});