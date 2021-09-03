'use strict';

app.controller('OfflineMeterFileController', function(
	$scope, 
	$window,
	$translate,
	$interval, 
	OfflineMeterFileService, 
	toaster, 
	SweetAlert) {

	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

	$scope.getAllOfflineMeterFiles = function() {
		OfflineMeterFileService.getAllOfflineMeterFiles(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeterfiles = response.data;
			} else {
				$scope.offlinemeterfiles = [];
			}
		});

	};

	$scope.dzOptions = {
		url: getAPI() + 'offlinemeterfiles',
		acceptedFiles: '.xlsx',
		dictDefaultMessage: 'Click(or Drop) to add files',
		maxFilesize: '100',
		headers: { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token }
	};

	$scope.dzCallbacks = {
		'addedfile': function(file) {
			console.info('File added.', file);
		},
		'success': function(file, xhr) {
			toaster.pop({
				type: "success",
				title: $translate.instant("TOASTER.SUCCESS_TITLE"),
				body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: file.name}),
				showCloseButton: true,
			});
			$scope.getAllOfflineMeterFiles();
		},
        'error': function (file, xhr) {
            toaster.pop({
                type: "error",
                title: $translate.instant("TOASTER.FAILURE_TITLE"),
                body: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: file.name}),
                showCloseButton: true,
            });
        }
    };

    $scope.restoreOfflineMeterFile = function (offlinemeterfile) {
        OfflineMeterFileService.restoreOfflineMeterFile(offlinemeterfile, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant('TOASTER.SUCCESS_TITLE'),
                    body: $translate.instant('SETTING.RESTORE_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getAllOfflineMeterFiles();
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

	$scope.deleteOfflineMeterFile = function(offlinemeterfile) {
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
					OfflineMeterFileService.deleteOfflineMeterFile(offlinemeterfile, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.OFFLINE_METER_FILE")}),
                                showCloseButton: true,
                            });
							$scope.getAllOfflineMeterFiles();
						} else if (angular.isDefined(response.status) && response.status === 400) {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant(response.data.title),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
						} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.FAILURE_TITLE"),
                                body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.OFFLINE_METER_FILE")}),
                                showCloseButton: true,
                            });
						}
					});
				}
			});
	};

	$scope.getAllOfflineMeterFiles();
	$interval.cancel();

	$scope.$on('$destroy', function() {
	     // Make sure that the interval is destroyed too
	     if (angular.isDefined($scope.refeshfiles)) {
	         $interval.cancel($scope.refeshfiles);
	         $scope.refeshfiles = undefined;
	     }
	});
	$scope.refeshfiles=$interval($scope.getAllOfflineMeterFiles,1000*8);

});
