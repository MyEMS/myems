'use strict';

app.controller('OfflineMeterFileController', function($scope, $common,  $cookies, $translate,$uibModal,$interval, OfflineMeterFileService, toaster, SweetAlert) {

	$scope.getAllOfflineMeterFiles = function() {
		OfflineMeterFileService.getAllOfflineMeterFiles(function(error, data) {
			if (!error) {
				$scope.offlinemeterfiles = data;
			} else {
				$scope.offlinemeterfiles = [];
			}
		});

	};

	$scope.dzOptions = {
		url: getAPI() + 'offlinemeterfiles',
		acceptedFiles: '.xlsx',
		dictDefaultMessage : 'Click(or Drop) to add files',
		maxFilesize: '100',
		headers: { "User-UUID": $cookies.get("user_uuid"), "Token": $cookies.get("token") }
	};

	$scope.dzCallbacks = {
		'addedfile': function(file) {
			console.info('File added.', file);
		},
		'success': function(file, xhr) {
			//console.log('File success to upload from dropzone', file, xhr);
					var templateName = file.name;

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

			// toaster.pop({
			// 	type: 'success',
			// 	title: $common.toaster.success_title,
			// 	body: $common.toaster.success_add_body.format(file.name),
			// 	showCloseButton: true,
			// });
			$scope.getAllOfflineMeterFiles();
		},
        'error': function (file, xhr) {
            //console.warn('File failed to upload from dropzone', file, xhr);
            var templateName = file.name;

            var popType = 'TOASTER.ERROR';
            var popTitle = $common.toaster.error_title;
            var popBody = $common.toaster.error_add_body;

            popType = $translate.instant(popType);
            popTitle = $translate.instant(popTitle);
            popBody = $translate.instant(popBody, {template: templateName});

            toaster.pop({
                type: popType,
                title: popTitle,
                body: popBody,
                showCloseButton: true,
            });
        }
    };



	$scope.deleteOfflineMeterFile = function(offlinemeterfile) {
		SweetAlert.swal({
				title: $translate.instant($common.sweet.title),
				text: $translate.instant($common.sweet.text),
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: $translate.instant($common.sweet.confirmButtonText),
				cancelButtonText: $translate.instant($common.sweet.cancelButtonText),
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function(isConfirm) {
				if (isConfirm) {
					OfflineMeterFileService.deleteOfflineMeterFile(offlinemeterfile, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
						    var templateName = "SETTING.OFFLINE_METER_FILE";
                            templateName = $translate.instant(templateName);

                            var popType = 'TOASTER.SUCCESS';
                            var popTitle = $common.toaster.success_title;
                            var popBody = $common.toaster.success_delete_body;

                            popType = $translate.instant(popType);
                            popTitle = $translate.instant(popTitle);
                            popBody = $translate.instant(popBody, {template: templateName});

                            toaster.pop({
                                type: popType,
                                title: popTitle,
                                body: popBody,
                                showCloseButton: true,
                            });

							$scope.getAllOfflineMeterFiles();
						} else if (angular.isDefined(status) && status == 400) {
							var popType = 'TOASTER.ERROR';
                            var popTitle = error.title;
                            var popBody = error.description;

                            popType = $translate.instant(popType);
                            popTitle = $translate.instant(popTitle);
                            popBody = $translate.instant(popBody);


                            toaster.pop({
                                type: popType,
                                title: popTitle,
                                body: popBody,
                                showCloseButton: true,
                            });
						} else {
							var templateName = "SETTING.OFFLINE_METER_FILE";
                            templateName = $translate.instant(templateName);

                            var popType = 'TOASTER.ERROR';
                            var popTitle = $common.toaster.error_title;
                            var popBody = $common.toaster.error_delete_body;

                            popType = $translate.instant(popType);
                            popTitle = $translate.instant(popTitle);
                            popBody = $translate.instant(popBody, {template: templateName});

                            toaster.pop({
                                type: popType,
                                title: popTitle,
                                body: popBody,
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
