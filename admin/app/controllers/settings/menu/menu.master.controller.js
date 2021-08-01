'use strict';

app.controller('MenuMasterController', function($scope) {

	$scope.$on('handleEmitMenuChanged', function(event) {
		$scope.$broadcast('handleBroadcastMenuChanged');
	});
});
