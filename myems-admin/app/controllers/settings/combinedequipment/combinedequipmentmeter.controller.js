'use strict';

app.controller('CombinedEquipmentMeterController', function (
    $scope,
    $rootScope,
    $window,
    $timeout,
    $uibModal,
    $translate,
    $q,
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
            $scope.combinedequipmentmeters = [];
            $scope.filterAvailableMeters();
        }
    };

    $scope.getMetersByCombinedEquipmentID = function (id) {
        var metertypes = ['meters', 'virtualmeters', 'offlinemeters'];
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        var promises = metertypes.map(function(value) {
            var deferred = $q.defer();
            CombinedEquipmentMeterService.getMetersByCombinedEquipmentID(id, value, headers, function (response) {
                if (angular.isDefined(response.status) && response.status === 200) {
                    angular.forEach(response.data, function (item, indx) {
                        response.data[indx].metertype = value;
                    });
                    deferred.resolve(response.data);
                } else {
                    deferred.reject(new Error('Failed to load meters for combined equipment: ' + value));
                }
            });
            return deferred.promise;
        });

        $q.all(promises).then(function(results) {
            $scope.combinedequipmentmeters = [].concat.apply([], results);
            $scope.filterAvailableMeters();
        }).catch(function(error) {
            console.error('Error loading meters:', error);
            $scope.combinedequipmentmeters = [];
            $scope.filterAvailableMeters();
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
                $scope.currentmeters = $scope.filteredMeters || [];
                break;
            case 'virtualmeters':
                $scope.currentmeters = $scope.filteredVirtualMeters || [];
                break;
            case 'offlinemeters':
                $scope.currentmeters = $scope.filteredOfflineMeters || [];
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
                $scope.filterAvailableMeters();
                $timeout(function(){
                    $scope.changeMeterType();
                }, 100);
            } else {
                $scope.meters = [];
                $scope.filteredMeters = [];
            }
        });

    };


    $scope.getAllOfflineMeters = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        OfflineMeterService.getAllOfflineMeters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.offlinemeters = response.data;
                $scope.filterAvailableMeters();
                if ($scope.currentMeterType === 'offlinemeters') {
                    $scope.changeMeterType();
                }
            } else {
                $scope.offlinemeters = [];
                $scope.filteredOfflineMeters = [];
            }
        });

    };

    $scope.getAllVirtualMeters = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        VirtualMeterService.getAllVirtualMeters(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.virtualmeters = response.data;
                $scope.filterAvailableMeters();
                if ($scope.currentMeterType === 'virtualmeters') {
                    $scope.changeMeterType();
                }
            } else {
                $scope.virtualmeters = [];
                $scope.filteredVirtualMeters = [];
            }
        });

    };

    // Filter out meters that are already bound to the current combined equipment,
    // keeping only available meters for selection
    $scope.filterAvailableMeters = function() {
        var boundSet = {};
        ($scope.combinedequipmentmeters || []).forEach(function(cem) {
            var keyType = cem.metertype || 'meters';
            if (angular.isDefined(cem.id)) {
                boundSet[keyType + '_' + String(cem.id)] = true;
            }
        });

        $scope.filteredMeters = ($scope.meters || []).filter(function(m){
            return !boundSet['meters_' + String(m.id)];
        });
        $scope.filteredVirtualMeters = ($scope.virtualmeters || []).filter(function(vm){
            return !boundSet['virtualmeters_' + String(vm.id)];
        });
        $scope.filteredOfflineMeters = ($scope.offlinemeters || []).filter(function(om){
            return !boundSet['offlinemeters_' + String(om.id)];
        });

        $scope.changeMeterType();
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
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if (tabIndex === TAB_INDEXES.BIND_METER) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentCombinedEquipment && $scope.currentCombinedEquipment.id) {
                $scope.getMetersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
            }
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || {};
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_METER) {
            if (!$scope.tabInitialized) {
                $scope.initTab();
            } else if ($scope.currentCombinedEquipment && $scope.currentCombinedEquipment.id) {
                $scope.getMetersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
            }
        }
    }, 0);

    $scope.$on('handleBroadcastCombinedEquipmentChanged', function (event) {
        if ($scope.tabInitialized) {
            $scope.getAllCombinedEquipments();
            if ($scope.currentCombinedEquipment && $scope.currentCombinedEquipment.id) {
                $scope.getMetersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
            }
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
