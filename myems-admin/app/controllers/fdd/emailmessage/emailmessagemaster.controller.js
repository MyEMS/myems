'use strict';

app.controller('EmailMessageMasterController', function($scope) {

	$scope.$on('handleEmitEmailMessageOptionChanged', function(event,args) {
		$scope.$broadcast('handleBroadcastEmailMessageOptionChanged',args);
	});

	$scope.$on('handleEmitEmailMessageTableChanged', function(event) {
		$scope.$broadcast('handleBroadcastEmailMessageTableChanged');
	});

});