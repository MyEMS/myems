'use strict';

app.controller('StoreMasterController', function($scope) {


	$scope.$on('handleEmitStoreChanged', function(event) {
		$scope.$broadcast('handleBroadcastStoreChanged');
	});

});
