'use strict';

app.controller('WorkingCalendarMasterController', function($scope) {


	$scope.$on('handleEmitWorkingCalendarChanged', function(event) {
		$scope.$broadcast('handleBroadcastWorkingCalendarChanged');
	});

});
