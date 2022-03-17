'use strict';

app.controller('TextMessageMasterController', function($scope) {

	$scope.$on('handleEmitTextMessageOptionChanged', function(event,args) {
		$scope.$broadcast('handleBroadcastTextMessageOptionChanged',args);
	});

	$scope.$on('handleEmitTextMessageTableChanged', function(event) {
		$scope.$broadcast('handleBroadcastTextMessageTableChanged');
	});

});