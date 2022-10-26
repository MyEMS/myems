'use strict';

app.controller('WebMessageOptionController', function(
	$scope, 
	$window,
	$timeout,
	$translate,
	WebMessageService) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.prorities = [{'key':$translate.instant('FDD.ALL'), 'value':'all'}, {'key':$translate.instant('FDD.LOW'), 'value':'low'},
	{'key':$translate.instant('FDD.MEDIUM'), 'value':'medium'}, {'key':$translate.instant('FDD.HIGH'), 'value':'high'},
	{'key':$translate.instant('FDD.CRITICAL'), 'value':'critical'}];
	$scope.notificationStatus = [{'key':$translate.instant('FDD.ALL'), 'value':'all'}, {'key':$translate.instant('FDD.READ'), 'value':'read'},
	{'key':$translate.instant('FDD.UNREAD'), 'value':'new'}, {'key':$translate.instant('FDD.ACKNOWLEDGED'), 'value':'acknowledged'}];
	$scope.daterange = {
		startDate: moment().subtract(7,'days'),
		endDate: moment()
	};
	$scope.priority = {'key':$translate.instant('FDD.ALL'), 'value':'all'};
	$scope.status = {'key':$translate.instant('FDD.ALL'), 'value':'all'};
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
			enddatetime: $scope.daterange.endDate.format().slice(0, 19),
			status: $scope.status.value,
			priority: $scope.priority.value
		};
		$scope.$emit('handleEmitWebMessageOptionChanged', {
			load: true,
			period:$scope.currentPeriod
		});
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WebMessageService.getResult(query, headers, function (response) {
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

	$scope.markAllWebMessageAsRead = function() {
		let webmessage = {'status': 'read'}
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WebMessageService.markAllWebMessageAsRead(webmessage, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.$emit('handleEmitWebMessageTableChanged');
			}
		});
	};

});
