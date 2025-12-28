'use strict';

app.controller('CombinedEquipmentEquipmentController', function (
    $scope,
    $window,
    $translate,
    CombinedEquipmentService,
    EquipmentService,
    CombinedEquipmentEquipmentService,
    toaster,
    SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentCombinedEquipment = {selected:undefined};

    $scope.getAllEquipments = function () {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EquipmentService.getAllEquipments(headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                let allEquipments = response.data;
                $scope.equipments = allEquipments.filter(function (equipment) {
                    return !$scope.combinedequipmentequipments.some(function (combinedEquipmentEquipment) {
                        return combinedEquipmentEquipment.id === equipment.id;
                    });
                });
            } else {
                $scope.equipments = [];
            }
        });
    };

    $scope.getEquipmentsByCombinedEquipmentID = function (id) {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentEquipmentService.getEquipmentsByCombinedEquipmentID(id, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.combinedequipmentequipments = response.data;
                $scope.getAllEquipments(); // Refresh the equipment list after fetching combined equipment equipments
            } else {
                $scope.combinedequipmentequipments = [];
                $scope.getAllEquipments(); // Ensure equipment list is refreshed even if no combined equipment equipments are found
            }
        });
    };

  $scope.changeCombinedEquipment=function(item,model){
  	$scope.currentCombinedEquipment=item;
  	$scope.currentCombinedEquipment.selected=model;
  	$scope.getEquipmentsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
  };

  $scope.getAllCombinedEquipments = function () {
    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
    CombinedEquipmentService.getAllCombinedEquipments(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
            $scope.combinedequipments = response.data;
        } else {
            $scope.combinedequipments = [];
        }
    });
  };

    $scope.pairEquipment = function (dragEl, dropEl) {
        var equipmentid = angular.element('#' + dragEl).scope().equipment.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentEquipmentService.addPair(combinedequipmentid, equipmentid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant('TOASTER.BIND_EQUIPMENT_SUCCESS'),
                    showCloseButton: true,
                });

                $scope.getEquipmentsByCombinedEquipmentID($scope.currentCombinedEquipment.id);
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

    $scope.deleteEquipmentPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var combinedequipmentequipmentid = angular.element('#' + dragEl).scope().combinedequipmentequipment.id;
        var combinedequipmentid = $scope.currentCombinedEquipment.id;
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        CombinedEquipmentEquipmentService.deletePair(combinedequipmentid, combinedequipmentequipmentid, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant('TOASTER.UNBIND_EQUIPMENT_SUCCESS'),
                    showCloseButton: true,
                });

                $scope.getEquipmentsByCombinedEquipmentID($scope.currentCombinedEquipment.id); // Refresh the combined equipment equipments
                $scope.getAllEquipments(); // Refresh the equipment list
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
            $scope.getAllEquipments();
            $scope.getAllCombinedEquipments();
        }
    };

    $scope.$on('combinedequipment.tabSelected', function(event, tabIndex) {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { BIND_EQUIPMENT: 1 };
        if (tabIndex === TAB_INDEXES.BIND_EQUIPMENT && !$scope.tabInitialized) {
            $scope.initTab();
        }
    });

    $timeout(function() {
        var TAB_INDEXES = ($scope.$parent && $scope.$parent.TAB_INDEXES) || { BIND_EQUIPMENT: 1 };
        if ($scope.$parent && $scope.$parent.activeTabIndex === TAB_INDEXES.BIND_EQUIPMENT && !$scope.tabInitialized) {
            $scope.initTab();
        }
    }, 0);

  	$scope.$on('handleBroadcastCombinedEquipmentChanged', function(event) {
      if ($scope.tabInitialized) {
          $scope.getAllCombinedEquipments();
      }
  	});
});
