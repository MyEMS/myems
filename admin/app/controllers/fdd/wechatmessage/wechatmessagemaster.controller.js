'use strict';

app.controller('WechatMessageMasterController', function($scope) {

	$scope.$on('handleEmitWechatMessageOptionChanged', function(event,args) {
		$scope.$broadcast('handleBroadcastWechatMessageOptionChanged',args);
	});

	$scope.$on('handleEmitWechatMessageTableChanged', function(event) {
		$scope.$broadcast('handleBroadcastWechatMessageTableChanged');
	});

});
