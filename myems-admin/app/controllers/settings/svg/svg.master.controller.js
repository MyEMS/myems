'use strict';

// SVG master controller - coordinates tab events between child controllers

app.controller('SVGMasterController', function($scope) {

	$scope.$on('handleEmitSVGChanged', function(event) {
		$scope.$broadcast('handleBroadcastSVGChanged');
	});
});
