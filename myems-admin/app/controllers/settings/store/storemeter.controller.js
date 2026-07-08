'use strict';

// Store Meter controller - drag-and-drop meter binding

app.controller('StoreMeterController', function(
    $scope,
    $rootScope,
    $window,
    $timeout,
    $translate,
    $q,
    MeterService,
    VirtualMeterService,
    OfflineMeterService,
    StoreMeterService,
    StoreService,
    toaster,
    SweetAlert,
    DragDropWarningService
) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentStore = { selected: undefined };
    $scope.currentMeterType = "meters";
    $scope.isStoreSelected = false;

    // Load all stores from API
    $scope.getAllStores = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreService.getAllStores(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.stores = response.data;
            } else {
                $scope.stores = [];
            }
        });
    };

    // Handle store change
    $scope.changeStore = function(item, model) {
        $scope.currentStore = item;
        $scope.currentStore.selected = model;
        if ($scope.currentStore && $scope.currentStore.id) {
            $scope.isStoreSelected = true;
            $scope.getMetersByStoreID($scope.currentStore.id);
        } else {
            $scope.isStoreSelected = false;
            $scope.storemeters = [];
            $scope.filterAvailableMeters();
        }
    };

    // Load meters by store id
    $scope.getMetersByStoreID = function(id) {
        var metertypes = ['meters', 'virtualmeters', 'offlinemeters'];
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        var promises = metertypes.map(function(value) {
            var deferred = $q.defer();
            StoreMeterService.getMetersByStoreID(id, value, headers, function(response) {
                if (angular.isDefined(response.status) && response.status === 200) {
                    angular.forEach(response.data, function(item, indx) {
                        response.data[indx].metertype = value;
                    });
                    deferred.resolve(response.data);
                } else {
                    deferred.reject(new Error('Failed to load meters for store: ' + value));
                }
            });
            return deferred.promise;
        });

        $q.all(promises).then(function(results) {
            $scope.storemeters = [].concat.apply([], results);
            $scope.filterAvailableMeters();
        }).catch(function(error) {
            console.error('Error loading meters:', error);
            $scope.storemeters = [];
            $scope.filteredMeters = [];
            $scope.filteredVirtualMeters = [];
            $scope.filteredOfflineMeters = [];
            $scope.filterAvailableMeters();
        });
    };

    // Return CSS class for meter type
    $scope.colorMeterType = function(type) {
        if (type == 'meters') {
            return 'btn-primary';
        } else if (type == 'virtualmeters') {
            return 'btn-info';
        } else {
            return 'btn-success';
        }
    };

    // Handle meter type change
    $scope.changeMeterType = function() {
        // Defensive assignment to prevent race conditions
        $scope.filteredMeters = $scope.filteredMeters || [];
        $scope.filteredVirtualMeters = $scope.filteredVirtualMeters || [];
        $scope.filteredOfflineMeters = $scope.filteredOfflineMeters || [];
        
        switch ($scope.currentMeterType) {
            case 'meters':
                $scope.currentmeters = $scope.filteredMeters;
                break;
            case 'virtualmeters':
                $scope.currentmeters = $scope.filteredVirtualMeters;
                break;
            case 'offlinemeters':
                $scope.currentmeters = $scope.filteredOfflineMeters;
                break;
        }
    };

    // Load all meters from API
    $scope.getAllMeters = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        MeterService.getAllMeters(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.meters = response.data;
                $scope.currentMeterType = "meters";
                $scope.filterAvailableMeters();
                $timeout(function() {
                    $scope.changeMeterType();
                }, 100);
            } else {
                $scope.meters = [];
            }
        });
    };

    // Load all offline meters from API
    $scope.getAllOfflineMeters = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        OfflineMeterService.getAllOfflineMeters(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.offlinemeters = response.data;
                $scope.filterAvailableMeters();
            } else {
                $scope.offlinemeters = [];
            }
        });
    };

    // Load all virtual meters from API
    $scope.getAllVirtualMeters = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        VirtualMeterService.getAllVirtualMeters(headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.virtualmeters = response.data;
                $scope.filterAvailableMeters();
            } else {
                $scope.virtualmeters = [];
            }
        });
    };

    // Filter out meters already bound to the current store, keeping only available ones for selection
    $scope.filterAvailableMeters = function() {
        var boundSet = {};
        ($scope.storemeters || []).forEach(function(sm) {
            var keyType = sm.metertype || 'meters';
            if (angular.isDefined(sm.id)) {
                boundSet[keyType + '_' + String(sm.id)] = true;
            }
        });

        $scope.filteredMeters = ($scope.meters || []).filter(function(m) {
            return !boundSet['meters_' + String(m.id)];
        });
        $scope.filteredVirtualMeters = ($scope.virtualmeters || []).filter(function(vm) {
            return !boundSet['virtualmeters_' + String(vm.id)];
        });
        $scope.filteredOfflineMeters = ($scope.offlinemeters || []).filter(function(om) {
            return !boundSet['offlinemeters_' + String(om.id)];
        });

        $scope.changeMeterType();
    };

    // Bind meter via drag-and-drop
    $scope.pairMeter = function(dragEl, dropEl) {
        if (!$scope.isStoreSelected || !$scope.currentStore || !$scope.currentStore.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_STORE_FIRST");
            return;
        }
        var meterid = angular.element('#' + dragEl).scope().meter.id;
        var storeid = $scope.currentStore.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        
        // Check if this meter is already bound to other stores using backend API (fast)
        StoreMeterService.checkMeterBinding(meterid, $scope.currentMeterType, headers, function(response) {
            var otherStoresWithMeter = [];
            
            if (angular.isDefined(response.status) && response.status === 200) {
                // Filter out the current store from the results
                angular.forEach(response.data, function(store) {
                    if (store.id !== storeid) {
                        otherStoresWithMeter.push(store.name);
                    }
                });
            } else {
                // If API call fails, log error and proceed with binding anyway
                console.error('Failed to check meter binding:', response);
                // Still allow binding to proceed even if check fails
            }
            
            // If meter is bound to other stores, ask for confirmation
            if (otherStoresWithMeter.length > 0) {
                var storeText = $translate.instant("COMMON.STORE");
                var messageTemplate = $translate.instant("SETTING.CONFIRM_BIND_METER_MESSAGE");
                var message = messageTemplate.replace('{0}', storeText).replace('{1}', otherStoresWithMeter.join(', ')).replace('{2}', storeText).replace('{3}', storeText);
                
                SweetAlert.swal({
                    title: $translate.instant("SETTING.CONFIRM_BIND_METER"),
                    text: message,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: $translate.instant("SETTING.YES"),
                    cancelButtonText: $translate.instant("SETTING.NO"),
                    closeOnConfirm: true
                }, function(isConfirm) {
                    if (isConfirm) {
                        performBinding(storeid, meterid, $scope.currentMeterType, headers);
                    }
                });
            } else {
                // Meter is not bound to any other store, proceed directly
                performBinding(storeid, meterid, $scope.currentMeterType, headers);
            }
        });
    };

    // Helper function to perform binding operation
    function performBinding(storeid, meterid, metertype, headers) {
        StoreMeterService.addPair(storeid, meterid, metertype, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_METER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMetersByStoreID($scope.currentStore.id);
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

    // Unbind meter via drag-to-trash
    $scope.deleteMeterPair = function(dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        if (!$scope.isStoreSelected || !$scope.currentStore || !$scope.currentStore.id) {
            DragDropWarningService.showWarning("SETTING.PLEASE_SELECT_STORE_FIRST");
            return;
        }
        var storemeterid = angular.element('#' + dragEl).scope().storemeter.id;
        var storeid = $scope.currentStore.id;
        var metertype = angular.element('#' + dragEl).scope().storemeter.metertype;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        StoreMeterService.deletePair(storeid, storemeterid, metertype, headers, function(response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_METER_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getMetersByStoreID($scope.currentStore.id);
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

    $scope.getAllStores();
    $scope.getAllMeters();
    $scope.getAllVirtualMeters();
    $scope.getAllOfflineMeters();

    $scope.$on('handleBroadcastStoreChanged', function(event) {
        $scope.getAllStores();
    });

    // Register drag and drop warning event listeners
    // Listen directly to HJC-DRAG-DISABLED event and show warning
    $scope.$on('HJC-DRAG-DISABLED', function(event) {
        if (!$scope.isStoreSelected) {
            // Use rootScope flag to prevent multiple warnings from different controllers
            if (!$rootScope._storeDragWarningShown) {
                $rootScope._storeDragWarningShown = true;
                DragDropWarningService.showWarning('SETTING.PLEASE_SELECT_STORE_FIRST');
                $timeout(function() {
                    $rootScope._storeDragWarningShown = false;
                }, 500);
            }
        }
    });
});
