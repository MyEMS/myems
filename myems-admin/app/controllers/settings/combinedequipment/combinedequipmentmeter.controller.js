'use strict';

app.controller('CombinedEquipmentMeterController', function (
    $scope,
    $rootScope,
    $window,
    $timeout,
    $uibModal,
    $translate,
    MeterService,
    VirtualMeterService,
    OfflineMeterService,
    CombinedEquipmentMeterService,
    CombinedEquipmentService,
    toaster,
    DragDropWarningService,
    SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentCombinedEquipment = { selected: undefined };
    $scope.isCombinedEquipmentSelected = false;
    $scope.currentMeterType = "meters";
    $scope.currentmeters = [];

    $scope.getAllCombinedEquipments = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentService.getAllCombinedEquipments(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.combinedequipments = response.data;
            } else {
                $scope.combinedequipments = [];
            }
        });
    };

    $scope.changeCombinedEquipment = function (item, model) {
        $scope.currentCombinedEquipment = item;
        $scope.currentCombinedEquipment.selected = model;
        if (item && item.id) {
            $scope.isCombinedEquipmentSelected = true;
            $scope.getMetersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
        } else {
            $scope.isCombinedEquipmentSelected = false;
        }
    };

    $scope.getMetersByCombinedEquipmentID = function (id) {
        var metertypes = ['meters', 'virtualmeters', 'offlinemeters'];
        $scope.combinedequipmentmeters = [];
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        angular.forEach(metertypes, function (value, index) {
            CombinedEquipmentMeterService.getMetersByCombinedEquipmentID(id, value, headers, function (response) {
                if (angular.isDefined(response.status) && response.status === 200) {
                    angular.forEach(response.data, function (item, indx) {
                        response.data[indx].metertype = value;
                    });
                    $scope.combinedequipmentmeters = $scope.combinedequipmentmeters.concat(response.data);
                }
            });
        });
    };

    $scope.colorMeterType = function (type) {
        if (type == 'meters') {
            return 'btn-primary'
        } else if (type == 'virtualmeters') {
            return 'btn-info'
        } else {
            return 'btn-success'
        }
    };

    $scope.changeMeterType = function () {
        switch ($scope.currentMeterType) {
            case 'meters':
                $scope.currentmeters = $scope.meters || [];
                break;
            case 'virtualmeters':
                $scope.currentmeters = $scope.virtualmeters || [];
                break;
            case 'offlinemeters':
                $scope.currentmeters = $scope.offlinemeters || [];
                break;
            default:
                $scope.currentmeters = [];
        }
    };


    $scope.getAllMeters = function () {
         let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterService.getAllMeters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.meters = response.data;
                $scope.currentMeterType = "meters";
                $scope.changeMeterType();
            } else {
                $scope.meters = [];
                $scope.currentmeters = [];
            }
        });

    };


    $scope.getAllOfflineMeters = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        OfflineMeterService.getAllOfflineMeters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.offlinemeters = response.data;
                if ($scope.currentMeterType === 'offlinemeters') {
                    $scope.changeMeterType();
                }
            } else {
                $scope.offlinemeters = [];
            }
        });

    };

    $scope.getAllVirtualMeters = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        VirtualMeterService.getAllVirtualMeters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.virtualmeters = response.data;
                if ($scope.currentMeterType === 'virtualmeters') {
                    $scope.changeMeterType();
                }
            } else {
                $scope.virtualmeters = [];
            }
        });

    };

    $scope.pairMeter = function (dragEl, dropEl) {
        if (!$scope.isCombinedEquipmentSelected || !$scope.currentCombinedEquipment || !$scope.currentCombinedEquipment.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST");
            return;
        }
        var tem_uuid = angular.element('#' + dragEl);
        if (angular.isDefined(tem_uuid.scope().combinedequipmentmeter)) {
            return;
        }
        var modalInstance = $uibModal.open({
            templateUrl: 'views/settings/combinedequipment/combinedequipmentmeter.model.html',
            controller: 'ModalEditCombinedEquipmentMeterCtrl',
            backdrop: 'static',
            size: 'sm'
        });
        modalInstance.result.then(function (is_output) {
            var meterid = angular.element('#' + dragEl).scope().meter.id;
            var combinedequipmentid = $scope.currentCombinedEquipment.id;
            let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
            CombinedEquipmentMeterService.addPair(combinedequipmentid, meterid, $scope.currentMeterType, is_output, headers, function (response) {
                if (angular.isDefined(response.status) && response.status === 201) {
                    toaster.pop({
                        type: "success",
                        title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                        body: $translate.instant("TOASTER.BIND_METER_SUCCESS"),
                        showCloseButton: true,
                    });

                    $scope.getMetersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
                } else {
                    toaster.pop({
                        type: "error",
                        title: $translate.instant(response.data.title),
                        body: $translate.instant(response.data.description),
                        showCloseButton: true,
                    });
                }
            });
        }, function () {
        });
        $rootScope.modalInstance = modalInstance;
    };

    $scope.deleteMeterPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        if (!$scope.isCombinedEquipmentSelected || !$scope.currentCombinedEquipment || !$scope.currentCombinedEquipment.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST");
            return;
        }
        var combinedequipmentmeterid = angular.element('#' + dragEl).scope().combinedequipmentmeter.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
        var metertype = angular.element('#' + dragEl).scope().combinedequipmentmeter.metertype;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentMeterService.deletePair(combinedequipmentid, combinedequipmentmeterid, metertype, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_METER_SUCCESS"),
                    showCloseButton: true,
                });

                $scope.getMetersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
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

    $scope.tabInitialized = false;

    $scope.initTab = function() {
        if (!$scope.tabInitialized) {
            $scope.tabInitialized = true;
            $scope.getAllCombinedEquipments();
            $scope.getAllMeters();
            $scope.getAllVirtualMeters();
            $scope.getAllOfflineMeters();
        }
    };

    $scope.$on('combinedequipment.tabSelected', function(event, tabIndex) {
        if ($scope.$parent && $scope.$parent.TAB_INDEXES && tabIndex === $scope.$parent.TAB_INDEXES.BIND_METER && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        if ($scope.$parent && $scope.$parent.TAB_INDEXES && $scope.$parent.activeTabIndex === $scope.$parent.TAB_INDEXES.BIND_METER && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);

    $scope.$on('handleBroadcastCombinedEquipmentChanged', function (event) {
        if ($scope.tabInitialized) {
            $scope.getAllCombinedEquipments();
        }
    });

    // Register drag and drop warning event listeners
    // Use registerTabWarnings to avoid code duplication
    DragDropWarningService.registerTabWarnings(
        $scope,
        'BIND_METER',
        'SETTING.PLEASE_SELECT_COMBINED_EQUIPMENT_FIRST',
        { BIND_METER: 2 }
    );
});

app.controller('ModalEditCombinedEquipmentMeterCtrl', function ($scope, $uibModalInstance) {
    $scope.is_output = "false";

    $scope.ok = function () {
        $uibModalInstance.close(angular.fromJson($scope.is_output));
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
