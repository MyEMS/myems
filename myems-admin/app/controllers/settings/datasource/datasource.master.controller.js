'use strict';

// Data Source master controller - coordinates tab events between child controllers

app.controller('DataSourceMasterController', function($scope) {

	$scope.$on('handleEmitDataSourceChanged', function(event) {
		$scope.$broadcast('handleBroadcastDataSourceChanged');
	});

});