'use strict';

// Working Calendar master controller - coordinates tab events between child controllers

app.controller('WorkingCalendarMasterController', function($scope) {


	$scope.$on('handleEmitWorkingCalendarChanged', function(event) {
		$scope.$broadcast('handleBroadcastWorkingCalendarChanged');
	});

});
