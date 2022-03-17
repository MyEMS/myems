'use strict';

app.controller('ShopfloorMasterController', function($scope) {

	$scope.$on('handleEmitShopfloorChanged', function(event) {
		$scope.$broadcast('handleBroadcastShopfloorChanged');
	});
});
