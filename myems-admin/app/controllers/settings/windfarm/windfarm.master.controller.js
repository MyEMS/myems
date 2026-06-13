'use strict';

// Wind Farm master controller - coordinates tab events between child controllers

app.controller('WindFarmMasterController', function($scope) {


	$scope.$on('handleEmitWindFarmChanged', function(event) {
		$scope.$broadcast('handleBroadcastWindFarmChanged');
	});

});
