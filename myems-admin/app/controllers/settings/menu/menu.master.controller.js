'use strict';

// Menu master controller - coordinates tab events between child controllers

app.controller('MenuMasterController', function($scope) {

	$scope.$on('handleEmitMenuChanged', function(event) {
		$scope.$broadcast('handleBroadcastMenuChanged');
	});
});
