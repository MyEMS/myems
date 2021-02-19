'use strict';

app.controller('CombinedEquipmentMasterController', function($scope) {

	$scope.$on('handleEmitCombinedEquipmentChanged', function(event) {
		$scope.$broadcast('handleBroadcastCombinedEquipmentChanged');
	});

});
