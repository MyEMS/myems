'use strict';

app.controller('KnowledgeFileController', function ($scope, $common, $cookies, $translate, $uibModal, KnowledgeFileService, toaster, SweetAlert) {

    $scope.getAllKnowledgeFiles = function () {
        KnowledgeFileService.getAllKnowledgeFiles(function (error, data) {
            if (!error) {
                $scope.knowledgefiles = data;
            } else {
                $scope.knowledgefiles = [];
            }
        });

    };

    $scope.dzOptions = {
        url: getAPI() + 'knowledgefiles',
        acceptedFiles: '.xlsx,.xls,.pdf,.docx,.doc,.dwg,.jpg,.png,.csv',
        dictDefaultMessage: 'Click(or Drop) to add files',
        maxFilesize: '100',
        headers: { "User-UUID": $cookies.get("user_uuid"), "Token": $cookies.get("token") }
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

            $scope.getAllKnowledgeFiles();
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
        }
    };
    $scope.restoreKnowledgeFile = function (knowledgefile) {
        KnowledgeFileService.restoreKnowledgeFile(knowledgefile, function (error, data) {
            if (!error) {
                toaster.pop({
                    type: $translate.instant('TOASTER.SUCCESS'),
                    title: $translate.instant('TOASTER.SUCCESS_TITLE'),
                    body: $translate.instant('KNOWLEDGEFILE.RESTORE_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getAllKnowledgeFiles();
            } else {
                toaster.pop({
                    type: $translate.instant('TOASTER.ERROR'),
                    title: $translate.instant(error.title),
                    body: $translate.instant(error.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.deleteKnowledgeFile = function (knowledgefile) {
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
                    KnowledgeFileService.deleteKnowledgeFile(knowledgefile, function (error, status) {
                        if (angular.isDefined(status) && status == 204) {
                            var templateName = "SETTING.KNOWLEDGEFILE";
                            templateName = $translate.instant(templateName);

                            var popType = 'TOASTER.SUCCESS';
                            var popTitle = $common.toaster.success_title;
                            var popBody = $common.toaster.success_delete_body;

                            popType = $translate.instant(popType);
                            popTitle = $translate.instant(popTitle);
                            popBody = $translate.instant(popBody, { template: templateName });

                            toaster.pop({
                                type: popType,
                                title: popTitle,
                                body: popBody,
                                showCloseButton: true,
                            });
                            $scope.getAllKnowledgeFiles();
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
                            var templateName = "SETTING.KNOWLEDGEFILE";
                            templateName = $translate.instant(templateName);

                            var popType = 'TOASTER.ERROR';
                            var popTitle = $common.toaster.error_title;
                            var popBody = $common.toaster.error_delete_body;

                            popType = $translate.instant(popType);
                            popTitle = $translate.instant(popTitle);
                            popBody = $translate.instant(popBody, { template: templateName });

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
    $scope.getAllKnowledgeFiles();

});
