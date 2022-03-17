'use strict';

app.controller('TenantMasterController', function($scope) {
	$scope.$on('handleEmitTenantChanged', function(event) {
		$scope.$broadcast('handleBroadcastTenantChanged');
	});

});
