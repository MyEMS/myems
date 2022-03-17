'use strict';

app.controller('SpaceMasterController', function($scope) {

	$scope.$on('handleEmitSpaceChanged', function(event) {
		$scope.$broadcast('handleBroadcastSpaceChanged');
	});
});
