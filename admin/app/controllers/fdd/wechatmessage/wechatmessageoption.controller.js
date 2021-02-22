'use strict';

app.controller('WechatMessageOptionController', function($scope, $timeout,
	WechatMessageAnalysisService) {
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
		var query = {
			datestart: $scope.daterange.startDate.format().slice(0, 10),
			dateend: $scope.daterange.endDate.format().slice(0, 10)
		};
		$scope.$emit('handleEmitWechatMessageOptionChanged', {
			load: true,
			period:$scope.currentPeriod
		});
		WechatMessageAnalysisService.getAnalysisResult(query, function(error, data) {
				if (!error) {
					$scope.$emit('handleEmitWechatMessageOptionChanged', data);
				}
		});

	};
	$timeout(function() {
		$scope.execute();
	}, 0);
	$scope.$on('handleBroadcastWechatMessageTableChanged', function(event) {
		$scope.execute();
	});
});
