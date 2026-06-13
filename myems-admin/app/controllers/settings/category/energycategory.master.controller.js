'use strict';

// Energy Category master controller - coordinates tab events between child controllers

app.controller('EnergyCategoryMasterController', function($scope) {

	$scope.$on('handleEmitEnergyCategoryChanged', function(event) {
		$scope.$broadcast('handleBroadcastEnergyCategoryChanged');
	});

});
