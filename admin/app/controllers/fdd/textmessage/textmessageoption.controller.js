'use strict';

app.controller('TextMessageOptionController', function($scope, $timeout,
	TextMessageAnalysisService) {
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
			applyLabel: "确定",
			cancelLabel: "取消",
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
		
		TextMessageAnalysisService.getAnalysisResult(query, function (response) {
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