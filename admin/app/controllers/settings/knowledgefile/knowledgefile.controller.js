'use strict';

app.controller('KnowledgeFileController', function (
    $scope, 
	$window,
    $translate, 
    KnowledgeFileService, 
    toaster, 
    SweetAlert) {
    
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

    $scope.getAllKnowledgeFiles = function () {
        KnowledgeFileService.getAllKnowledgeFiles(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.knowledgefiles = response.data;
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
        headers: { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token }
    };

    $scope.dzCallbacks = {
        'addedfile': function (file) {
            console.info('File added.', file);
        },
        'success': function (file, xhr) {
            toaster.pop({
                type: "success",
                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: file.name}),
                showCloseButton: true,
            });
            $scope.getAllKnowledgeFiles();
        },
        'error': function (file, xhr) {
            toaster.pop({
                type: "error",
                title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: file.name}),
                body: $translate.instant(response.data.description),
                showCloseButton: true,
            });
        }
    };
    $scope.restoreKnowledgeFile = function (knowledgefile) {
        KnowledgeFileService.restoreKnowledgeFile(knowledgefile, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant('TOASTER.SUCCESS_TITLE'),
                    body: $translate.instant('SETTING.RESTORE_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getAllKnowledgeFiles();
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

    $scope.deleteKnowledgeFile = function (knowledgefile) {
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
        function (isConfirm) {
            if (isConfirm) {
                KnowledgeFileService.deleteKnowledgeFile(knowledgefile, function (response) {
                    if (angular.isDefined(response.status) && response.status === 204) {
                        toaster.pop({
                            type: "success",
                            title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                            body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("SETTING.KNOWLEDGEFILE") }),
                            showCloseButton: true,
                        });
                        $scope.getAllKnowledgeFiles();
                    } else {
                        toaster.pop({
                            type: "error",
                            title: $translate.instant("TOASTER.ERROR_DELETE_BODY", { template: $translate.instant("SETTING.KNOWLEDGEFILE") }),
                            body: $translate.instant(response.data.description),
                            showCloseButton: true,
                        });
                    }
                });
            }
        });
    };
    $scope.getAllKnowledgeFiles();

});
