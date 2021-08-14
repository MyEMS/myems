'use strict';

app.controller('CombinedEquipmentMeterController', function ($scope, $timeout, $uibModal, $translate, MeterService, VirtualMeterService, OfflineMeterService, CombinedEquipmentMeterService, CombinedEquipmentService, toaster, SweetAlert) {
    $scope.currentCombinedEquipment = { selected: undefined };

    $scope.getAllCombinedEquipments = function (id) {
        CombinedEquipmentService.getAllCombinedEquipments(function (response) {
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
        $scope.getMetersByCombinedEquipmentID($scope.currentCombinedEquipment.id);
    };

    $scope.getMetersByCombinedEquipmentID = function (id) {
        var metertypes = ['meters', 'virtualmeters', 'offlinemeters'];
        $scope.combinedequipmentmeters = [];
        angular.forEach(metertypes, function (value, index) {
            CombinedEquipmentMeterService.getMetersByCombinedEquipmentID(id, value, function (response) {
                if (angular.isDefined(response.status) && response.status === 200) {
                    angular.forEach(response.data, function (item, indx) {
                        data[indx].metertype = value;
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
                $scope.currentmeters = $scope.meters;
                break;
            case 'virtualmeters':
                $scope.currentmeters = $scope.virtualmeters;
                break;
            case 'offlinemeters':
                $scope.currentmeters = $scope.offlinemeters;
                break;
        }
    };


    $scope.getAllMeters = function () {
        MeterService.getAllMeters(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.meters = response.data;
                $scope.currentMeterType = "meters";
                $timeout(function () {
                    $scope.changeMeterType();
                }, 1000);
            } else {
                $scope.meters = [];
            }
        });

    };


    $scope.getAllOfflineMeters = function () {
        OfflineMeterService.getAllOfflineMeters(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.offlinemeters = response.data;
            } else {
                $scope.offlinemeters = [];
            }
        });

    };

    $scope.getAllVirtualMeters = function () {
        VirtualMeterService.getAllVirtualMeters(function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.virtualmeters = response.data;
            } else {
                $scope.virtualmeters = [];
            }
        });

    };

    $scope.pairMeter = function (dragEl, dropEl) {
        var tem_uuid = angular.element('#' + dragEl);
        if (angular.isDefined(tem_uuid.scope().combinedequipmentmeter)) {
            console.log("this is a spacemeter");
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
            CombinedEquipmentMeterService.addPair(combinedequipmentid, meterid, $scope.currentMeterType, is_output, function (response) {
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
    };

    $scope.deleteMeterPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var combinedequipmentmeterid = angular.element('#' + dragEl).scope().combinedequipmentmeter.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
        var metertype = angular.element('#' + dragEl).scope().combinedequipmentmeter.metertype;
        CombinedEquipmentMeterService.deletePair(combinedequipmentid, combinedequipmentmeterid, metertype, function (response) {
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

    $scope.getAllCombinedEquipments();
    $scope.getAllMeters();
    $scope.getAllVirtualMeters();
    $scope.getAllOfflineMeters();

    $scope.$on('handleBroadcastCombinedEquipmentChanged', function (event) {
        $scope.getAllCombinedEquipments();
    });
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
