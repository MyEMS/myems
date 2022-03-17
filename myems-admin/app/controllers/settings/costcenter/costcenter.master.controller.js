'use strict';

app.controller('CostCenterMasterController', function($scope) {

	$scope.$on('handleEmitCostCenterChanged', function(event) {
		$scope.$broadcast('handleBroadcastCostCenterChanged');
	});

});
