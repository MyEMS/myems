'use strict';

app.controller('WorkingCalendarController', function(
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    WorkingCalendarService,
    toaster,
    SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.getAllWorkingCalendars = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WorkingCalendarService.getAllWorkingCalendars(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.workingcalendars = response.data;
			} else {
				$scope.workingcalendars = [];
			}
		});
	};

	$scope.addWorkingCalendar = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/workingcalendar/workingcalendar.model.html',
			controller: 'ModalAddWorkingCalendarCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						workingcalendars: angular.copy($scope.workingcalendars),
					};
				}
			}
		});
		modalInstance.result.then(function(workingcalendar) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WorkingCalendarService.addWorkingCalendar(workingcalendar, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
						showCloseButton: true,
					});
					$scope.getAllWorkingCalendars();
					$scope.$emit('handleEmitWorkingCalendarChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editWorkingCalendar = function(workingcalendar) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/workingcalendar/workingcalendar.model.html',
			controller: 'ModalEditWorkingCalendarCtrl',
			resolve: {
				params: function() {
					return {
						workingcalendar: angular.copy(workingcalendar),
						workingcalendars: angular.copy($scope.workingcalendars),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedWorkingCalendar) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WorkingCalendarService.editWorkingCalendar(modifiedWorkingCalendar, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
						showCloseButton: true,
					});
					$scope.getAllWorkingCalendars();
					$scope.$emit('handleEmitWorkingCalendarChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.deleteWorkingCalendar = function(workingcalendar) {
		SweetAlert.swal({
				title: $translate.instant("SWEET.TITLE"),
				text: $translate.instant("SWEET.TEXT"),
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
				cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function(isConfirm) {
				if (isConfirm) {
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
					WorkingCalendarService.deleteWorkingCalendar(workingcalendar, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
                                showCloseButton: true,
                            });
							$scope.getAllWorkingCalendars();
							$scope.$emit('handleEmitWorkingCalendarChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}
			});
	};

	$scope.exportWorkingCalendar = function(workingcalendar) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WorkingCalendarService.exportWorkingCalendar(workingcalendar, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.exportdata = JSON.stringify(response.data);
				var modalInstance = $uibModal.open({
					windowClass: "animated fadeIn",
					templateUrl: 'views/common/export.html',
					controller: 'ModalExportCtrl',
					resolve: {
						params: function() {
							return {
								exportdata: angular.copy($scope.exportdata)
							};
						}
					}
				});
				modalInstance.result.then(function() {
					//do nothing;
				}, function() {
					//do nothing;
				});
				$rootScope.modalInstance = modalInstance;
			} else {
				$scope.exportdata = null;
			}
		});
	};

	$scope.cloneWorkingCalendar = function(workingcalendar){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		WorkingCalendarService.cloneWorkingCalendar(workingcalendar, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
					showCloseButton: true,
				});
				$scope.getAllWorkingCalendars();
				$scope.$emit('handleEmitWorkingCalendarChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importWorkingCalendar = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/common/import.html',
			controller: 'ModalImportCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
					};
				}
			}
		});
		modalInstance.result.then(function(importdata) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WorkingCalendarService.importWorkingCalendar(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.WORKING_CALENDAR")}),
						showCloseButton: true,
					});
					$scope.getAllWorkingCalendars();
					$scope.$emit('handleEmitWorkingCalendarChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.WORKING_CALENDAR") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllWorkingCalendars();
});

app.controller('ModalAddWorkingCalendarCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "WORKING_CALENDAR.ADD_WORKING_CALENDAR";
	$scope.ok = function() {
		$uibModalInstance.close($scope.workingcalendar);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditWorkingCalendarCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "WORKING_CALENDAR.EDIT_WORKING_CALENDAR";
	$scope.workingcalendar = params.workingcalendar;
	$scope.workingcalendars = params.workingcalendars;
	$scope.ok = function() {
		$uibModalInstance.close($scope.workingcalendar);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
