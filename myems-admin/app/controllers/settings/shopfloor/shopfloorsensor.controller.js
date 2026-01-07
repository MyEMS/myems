app.controller('ShopfloorSensorController', function (
    $scope,
    $window,
    $timeout,
    $translate,
    ShopfloorService,
    SensorService,
    ShopfloorSensorService,
    toaster,
    SweetAlert,
    DragDropWarningService) {

    $scope.currentShopfloor = {selected: undefined};
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.isShopfloorSelected = false;
    $scope.shopfloorsensors = [];

    $scope.getAllSensors = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        SensorService.getAllSensors(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allSensors = response.data;
                $scope.sensors = allSensors.filter(function(sensor) {
                    return !($scope.shopfloorsensors || []).some(function(ss) {
                        return ss.id === sensor.id;
                    });
                });
            } else {
                $scope.sensors = [];
            }
        });
    };

    $scope.getSensorsByShopfloorID = function(id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorSensorService.getSensorsByShopfloorID(id, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloorsensors = response.data;
                $scope.getAllSensors();
            } else {
                $scope.shopfloorsensors = [];
                $scope.getAllSensors();
            }
        });
    };

    $scope.changeShopfloor = function(item, model) {
        $scope.currentShopfloor = item;
        $scope.currentShopfloor.selected = model;
        if (item && item.id) {
            $scope.isShopfloorSelected = true;
            $scope.getSensorsByShopfloorID($scope.currentShopfloor.id);
        } else {
            $scope.isShopfloorSelected = false;
        }
    };

    $scope.getAllShopfloors = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorService.getAllShopfloors(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.shopfloors = response.data;
            } else {
                $scope.shopfloors = [];
            }
        });
    };

    $scope.pairSensor = function(dragEl, dropEl) {
        if (!$scope.isShopfloorSelected || !$scope.currentShopfloor || !$scope.currentShopfloor.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_SHOPFLOOR_FIRST");
            return;
        }
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorSensorService.addPair(shopfloorid, sensorid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByShopfloorID(shopfloorid);
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

    $scope.deleteSensorPair = function(dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) return;
        if (!$scope.isShopfloorSelected || !$scope.currentShopfloor || !$scope.currentShopfloor.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_SHOPFLOOR_FIRST");
            return;
        }
        var shopfloorsensorid = angular.element('#' + dragEl).scope().shopfloorsensor.id;
        var shopfloorid = $scope.currentShopfloor.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        ShopfloorSensorService.deletePair(shopfloorid, shopfloorsensorid, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByShopfloorID(shopfloorid);
                $scope.getAllSensors();
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

    $scope.getAllShopfloors();
    $scope.getAllSensors();

    $scope.$on('handleBroadcastShopfloorChanged', function(event) {
        $scope.getAllShopfloors();
    });

    // Listen for disabled drag/drop events to show warning
    // Only show warning if this tab is currently active
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'BIND_SENSOR',
            'SETTING.PLEASE_SELECT_SHOPFLOOR_FIRST',
            { BIND_SENSOR: 4 }
        );
    });

    $scope.$on('HJC-DROP-DISABLED', function(event) {
        DragDropWarningService.showWarningIfActive(
            $scope,
            'BIND_SENSOR',
            'SETTING.PLEASE_SELECT_SHOPFLOOR_FIRST',
            { BIND_SENSOR: 4 }
        );
    });

});