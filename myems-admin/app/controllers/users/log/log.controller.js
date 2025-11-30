'use strict';
app.controller('LogController', function (
    $scope,
    $window,
    LogService,
    toaster,
    $translate
) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));

    $scope.logs = [];
    $scope.paginatedLogs = [];
    $scope.paging = {
        currentPage: 1,
        pageSize: 15
    };

    $scope.updatePaginatedLogs = function () {
        var begin = ($scope.paging.currentPage - 1) * $scope.paging.pageSize;
        var end = begin + $scope.paging.pageSize;
        $scope.paginatedLogs = $scope.logs.slice(begin, end);
    };

    $scope.pageChanged = function () {
        $scope.updatePaginatedLogs();
    };

    $scope.getLogs = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        LogService.getLogs(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.logs = angular.isArray(response.data) ? response.data : [];
                $scope.paging.currentPage = 1;
                $scope.updatePaginatedLogs();
            } else {
                $scope.logs = [];
                $scope.updatePaginatedLogs();
                if (response.data && response.data.description) {
                    toaster.pop({
                        type: "error",
                        title: $translate.instant("TOASTER.ERROR_TITLE"),
                        body: $translate.instant(response.data.description),
                        showCloseButton: true,
                    });
                }
            }
        });
    };

    $scope.getLogs();
});


