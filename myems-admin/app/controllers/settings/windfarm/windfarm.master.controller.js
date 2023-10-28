'use strict';

app.controller('WindFarmMasterController', function($scope) {


	$scope.$on('handleEmitWindFarmChanged', function(event) {
		$scope.$broadcast('handleBroadcastWindFarmChanged');
	});

});
