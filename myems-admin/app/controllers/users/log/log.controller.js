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

    $scope.getLogs = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        LogService.getLogs(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.logs = response.data;
            } else {
                $scope.logs = [];
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


