'use strict';

app.controller('DistributionSystemMasterController', function($scope) {

	$scope.$on('handleEmitDistributionSystemChanged', function(event) {
		$scope.$broadcast('handleBroadcastDistributionSystemChanged');
	});

	$scope.$on('handleEmitDistributionCircuitChanged', function(event) {
		$scope.$broadcast('handleBroadcastDistributionCircuitChanged');
	});


});
