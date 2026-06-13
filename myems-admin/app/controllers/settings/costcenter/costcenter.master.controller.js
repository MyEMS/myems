'use strict';

// Cost Center master controller - coordinates tab events between child controllers

app.controller('CostCenterMasterController', function($scope) {

	$scope.$on('handleEmitCostCenterChanged', function(event) {
		$scope.$broadcast('handleBroadcastCostCenterChanged');
	});

});
