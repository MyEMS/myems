'use strict';

app.controller('EquipmentMasterController', function($scope) {

	$scope.$on('handleEmitEquipmentChanged', function(event) {
		$scope.$broadcast('handleBroadcastEquipmentChanged');
	});

});
