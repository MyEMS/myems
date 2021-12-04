'use strict';

app.controller('TextMessageOptionController', function(
    $scope,
    $window,
    $timeout,
	TextMessageAnalysisService) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.daterange = {
		startDate: moment().subtract(7,'days'),
		endDate: moment()
	};
	$scope.dtOptions = {
		timePicker: false,
		timePicker24Hour: true,
		timePickerIncrement: 1,
		timePickerSeconds: true,
		startView:2,
		autoApply: true,
		locale:{
			format: 'YYYY-MM-DD',
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
		var datestart,dateend;
		var query = {
			datestart: $scope.daterange.startDate.format().slice(0, 10),
			dateend: $scope.daterange.endDate.format().slice(0, 10)
		};
		$scope.$emit('handleEmitTextMessageOptionChanged', {
			load: true,
			period:$scope.currentPeriod
		});
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		TextMessageAnalysisService.getAnalysisResult(query, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.$emit('handleEmitTextMessageOptionChanged', response.data);
			}
		});

	};
	$timeout(function() {
		$scope.execute();
	}, 0);
	$scope.$on('handleBroadcastTextMessageTableChanged', function(event) {
		$scope.execute();
	});
});