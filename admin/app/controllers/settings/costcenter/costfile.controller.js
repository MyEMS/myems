'use strict';

app.controller('CostFileController', function (
    $scope, 
	$window,
    $translate, 
    $interval, 
    CostFileService, 
    toaster, 
    SweetAlert) {

    $scope.cur_user = JSON.parse($window.localStorage.getItem("currentUser"));

    $scope.getAllCostFiles = function () {
        CostFileService.getAllCostFiles(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.costfiles = response.data;
            } else {
                $scope.costfiles = [];
            }
        });
    };

    $scope.dzOptions = {
        url: getAPI() + 'costfiles',
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
            toaster.pop({
                type: "success",
                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: file.name}),
                showCloseButton: true,
            });
            $scope.getAllCostFiles();
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

    $scope.restoreCostFile = function (costfile) {
        CostFileService.restoreCostFile(costfile, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant('TOASTER.SUCCESS_TITLE'),
                    body: $translate.instant('SETTING.RESTORE_SUCCESS'),
                    showCloseButton: true,
                });
                $scope.getAllCostFiles();
            } else {
                toaster.pop({
                    type: $translate.instant('TOASTER.ERROR'),
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.deleteCostFile = function (costfile) {
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
                    CostFileService.deleteCostFile(costfile, function (response) {
                        if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.COST_FILE")}),
                                showCloseButton: true,
                            });
                            $scope.getAllCostFiles();
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
                                body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("TOASTER.COST_FILE")}),
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