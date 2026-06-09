'use strict';

// Protocol master controller - coordinates tab events between child controllers

app.controller('ProtocolMasterController', function($scope) {

	$scope.$on('handleEmitProtocolChanged', function(event) {
		$scope.$broadcast('handleBroadcastProtocolChanged');
	});

});
