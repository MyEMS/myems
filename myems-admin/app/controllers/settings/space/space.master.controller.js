'use strict';

app.controller('SpaceMasterController', function($scope) {
	$scope.activeTabIndex = 0;
	$scope.initializedTabs = {};

	$scope.initializedTabs[0] = true;

	$scope.$watch('activeTabIndex', function(newIndex, oldIndex) {
		if (newIndex !== oldIndex && newIndex !== undefined) {
			if (!$scope.initializedTabs[newIndex]) {
				$scope.$broadcast('tabSelected', newIndex);
				$scope.initializedTabs[newIndex] = true;
			}
		}
	});

	$scope.$on('handleEmitSpaceChanged', function(event) {
		$scope.$broadcast('handleBroadcastSpaceChanged');
	});
});
