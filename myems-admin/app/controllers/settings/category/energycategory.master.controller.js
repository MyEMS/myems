'use strict';

app.controller('EnergyCategoryMasterController', function($scope) {

	$scope.$on('handleEmitEnergyCategoryChanged', function(event) {
		$scope.$broadcast('handleBroadcastEnergyCategoryChanged');
	});

});
