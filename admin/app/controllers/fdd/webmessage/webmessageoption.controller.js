'use strict';

app.controller('WebMessageOptionController', function(
	$scope, 
	$window,
	$timeout,
	WebMessageAnalysisService) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.daterange = {
		startDate: moment().subtract(7,'days'),
		endDate: moment()
	};
	$scope.dtOptions = {
		timePicker: true,
		timePicker24Hour: true,
		timePickerIncrement: 1,
		timePickerSeconds: true,
		startView:2,
		autoApply: true,
		locale:{
			format: 'YYYY-MM-DDTHH:mm:ss',
			applyLabel: "OK",
			cancelLabel: "Cancel",
		},
		eventHandlers:{
			'apply.daterangepicker':function(ev,picker){
				//$scope.execute();
			}
		}
	};

	$scope.execute = function() {
		var startdatetime, enddatetime;
		var query = {
			startdatetime: $scope.daterange.startDate.format().slice(0, 19),
			enddatetime: $scope.daterange.endDate.format().slice(0, 19)
		};
		$scope.$emit('handleEmitWebMessageOptionChanged', {
			load: true,
			period:$scope.currentPeriod
		});
		console.log(query)
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WebMessageAnalysisService.getAnalysisResult(query, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.$emit('handleEmitWebMessageOptionChanged', response.data);
				}
		});

	};
	$timeout(function() {
		$scope.execute();
	}, 0);
	$scope.$on('handleBroadcastWebMessageTableChanged', function(event) {
		$scope.execute();
	});
});
