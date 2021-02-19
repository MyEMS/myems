'use strict';

app.controller('DataSourceMasterController', function($scope) {

	$scope.$on('handleEmitDataSourceChanged', function(event) {
		$scope.$broadcast('handleBroadcastDataSourceChanged');
	});

});