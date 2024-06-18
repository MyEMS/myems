'use strict';

app.controller('SVGMasterController', function($scope) {

	$scope.$on('handleEmitSVGChanged', function(event) {
		$scope.$broadcast('handleBroadcastSVGChanged');
	});
});
