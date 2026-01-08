'use strict';

app.controller('StoreMasterController', function($scope) {


	$scope.$on('handleEmitStoreChanged', function(event) {
		$scope.$broadcast('handleBroadcastStoreChanged');
	});
	
	$scope.$on('handleEmitStoreTypeChanged', function(event) {
		$scope.$broadcast('handleBroadcastStoreTypeChanged');
	});

});
