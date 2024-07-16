'use strict';

app.controller('ProtocolMasterController', function($scope) {

	$scope.$on('handleEmitProtocolChanged', function(event) {
		$scope.$broadcast('handleBroadcastProtocolChanged');
	});

});
