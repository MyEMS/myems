'use strict';

app.controller('EmailMessageOptionController', function($scope, $timeout,
	EmailMessageAnalysisService) {
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
		$scope.$emit('handleEmitEmailMessageOptionChanged', {
			load: true,
			period:$scope.currentPeriod
		});
		
		if(true){
			EmailMessageAnalysisService.getAnalysisResult(query, function(error, data) {
				if (!error) {
					$scope.$emit('handleEmitEmailMessageOptionChanged', data);
				}
			});
		}else{
			EmailMessageAnalysisService.getTestDataResult(query, function(error, data) {
				if (!error) {
					$timeout(function(){
						$scope.$emit('handleEmitEmailMessageOptionChanged', data);
					},1000);

				}
			});
		}
		
	};
	$timeout(function() {
		$scope.execute();
	}, 0);
	$scope.$on('handleBroadcastEmailMessageTableChanged', function(event) {
		$scope.execute();
	});
});