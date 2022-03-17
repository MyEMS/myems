'use strict';

app.controller('WebMessageMasterController', function($scope) {

	$scope.$on('handleEmitWebMessageOptionChanged', function(event,args) {
		$scope.$broadcast('handleBroadcastWebMessageOptionChanged',args);
	});

	$scope.$on('handleEmitWebMessageTableChanged', function(event) {
		$scope.$broadcast('handleBroadcastWebMessageTableChanged');
	});

});