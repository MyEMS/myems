'use strict';

app.controller('CostFileController', function (
    $scope, 
	$window,
    $common, 
    $translate, 
    $uibModal, 
    $interval, 
    CostFileService, 
    toaster, 
    SweetAlert) {

    $scope.cur_user = JSON.parse($window.localStorage.getItem("currentUser"));

    $scope.getAllCostFiles = function () {
        CostFileService.getAllCostFiles(function (error, data) {
            if (!error) {
                $scope.costfiles = data;
            } else {
                $scope.costfiles = [];
            }
        });

    };

    $scope.dzOptions = {
        url: getAPI() + 'offlinecostfiles',
        acceptedFiles: '.xlsx',
        dictDefaultMessage: 'Click(or Drop) to add files',
        maxFilesize: '100',
        headers: { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token }
    };

    $scope.dzCallbacks = {
        'addedfile': function (file) {
            console.info('File added.', file);
        },
        'success': function (file, xhr) {
            //console.log('File success to upload from dropzone', file, xhr);
            var popType = 'TOASTER.SUCCESS';
            var popTitle = $common.toaster.success_title;
            var popBody = $common.toaster.success_add_body.format(file.name);

            popType = $translate.instant(popType);
            popTitle = $translate.instant(popTitle);
            popBody = $translate.instant(popBody);

            toaster.pop({
                type: popType,
                title: popTitle,
                body: popBody,
                showCloseButton: true,
            });

            // toaster.pop({
            //     type: 'success',
            //     title: $common.toaster.success_title,
            //     body: $common.toaster.success_add_body.format(file.name),
            //     showCloseButton: true,
            // });
            $scope.getAllCostFiles();
        },
        'error': function (file, xhr) {
            //console.warn('File failed to upload from dropzone', file, xhr);


            var popType = 'TOASTER.ERROR';
            var popTitle = $common.toaster.error_title;
            var popBody = $common.toaster.error_add_body.format(file.name);

            popType = $translate.instant(popType);
            popTitle = $translate.instant(popTitle);
            popBody = $translate.instant(popBody);

            toaster.pop({
                type: popType,
                title: popTitle,
                body: popBody,
                showCloseButton: true,
            });

            // toaster.pop({
            //     type: 'error',
            //     title: $common.toaster.error_title,
            //     body: $common.toaster.error_add_body.format(file.name),
            //     showCloseButton: true,
            // });
        }
    };


    $scope.deleteCostFile = function (costfile) {
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
            function (isConfirm) {
                if (isConfirm) {
                    CostFileService.deleteCostFile(costfile, function (error, status) {
                        if (angular.isDefined(status) && status == 204) {
                            var templateName = "TOASTER.COST_FILE";
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


                            $scope.getAllCostFiles();
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
                            var templateName = "TOASTER.COST_FILE";
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

    $scope.getAllCostFiles();
    $interval.cancel();

    $scope.$on('$destroy', function () {
        // Make sure that the interval is destroyed too
        if (angular.isDefined($scope.refeshfiles)) {
            $interval.cancel($scope.refeshfiles);
            $scope.refeshfiles = undefined;
        }
    });
    $scope.refeshfiles = $interval($scope.getAllCostFiles, 1000 * 8);

});