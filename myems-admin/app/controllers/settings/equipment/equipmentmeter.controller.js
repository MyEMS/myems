'use strict';

app.controller('EquipmentMeterController', function(
	$scope,
	$rootScope,
	$window,
	$timeout,
	$uibModal,
	$translate,
	MeterService,
	VirtualMeterService,
	OfflineMeterService,
	EquipmentMeterService,
	EquipmentService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentEquipment = {selected:undefined};
    $scope.currentMeterType = "meters";
	$scope.getAllEquipments = function(id) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EquipmentService.getAllEquipments(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.equipments = response.data;
			} else {
				$scope.equipments = [];
			}
		});
	};

	$scope.changeEquipment=function(item,model){
		$scope.currentEquipment=item;
		$scope.currentEquipment.selected=model;
		if ($scope.currentEquipment && $scope.currentEquipment.id) {
			$scope.getMetersByEquipmentID($scope.currentEquipment.id);
		} else {
			// If no device is selected, clear the bound list and refresh the available list
			$scope.equipmentmeters = [];
			$scope.filterAvailableMeters();
		}
	};

	$scope.getMetersByEquipmentID = function(id) {
		var metertypes=['meters','virtualmeters','offlinemeters'];
		$scope.equipmentmeters=[];
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		var pending = metertypes.length;
		angular.forEach(metertypes,function(value,index){
			EquipmentMeterService.getMetersByEquipmentID(id, value, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					angular.forEach(response.data,function(item, indx){
						response.data[indx].metertype = value;
					});
					$scope.equipmentmeters = $scope.equipmentmeters.concat(response.data);
				}
				pending--;
				if (pending === 0) {
					$scope.filterAvailableMeters();
				}
			});
		});
	};

	$scope.colorMeterType=function(type){
		if(type=='meters'){
			return 'btn-primary'
		}else if(type=='virtualmeters'){
			return 'btn-info'
		}else{
			return 'btn-success'
		}
	};

	$scope.changeMeterType=function(){
		switch($scope.currentMeterType){
			case 'meters':
				$scope.currentmeters=$scope.filteredMeters || [];
				break;
			case 'virtualmeters':
				$scope.currentmeters=$scope.filteredVirtualMeters || [];
				break;
			case 'offlinemeters':
				$scope.currentmeters=$scope.filteredOfflineMeters || [];
				break;
		}
	};

	$scope.getAllMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				$scope.currentMeterType="meters";
				$scope.filterAvailableMeters();
				$timeout(function(){
					$scope.changeMeterType();
				},100);
			} else {
				$scope.meters = [];
			}
		});
	};

	$scope.getAllOfflineMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		OfflineMeterService.getAllOfflineMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.offlinemeters = response.data;
				$scope.filterAvailableMeters();
			} else {
				$scope.offlinemeters = [];
			}
		});
	};

	$scope.getAllVirtualMeters = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		VirtualMeterService.getAllVirtualMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.virtualmeters = response.data;
				$scope.filterAvailableMeters();
			} else {
				$scope.virtualmeters = [];
			}
		});
	};

	$scope.filterAvailableMeters = function() {
		
		var boundSet = {};
		($scope.equipmentmeters || []).forEach(function(em) {
			var keyType = em.metertype || 'meters';
			// em.id should be the id of a specific table
			if (angular.isDefined(em.id)) {
				boundSet[keyType + '_' + em.id] = true;
			}
		});

		$scope.filteredMeters = ($scope.meters || []).filter(function(m){
			return !boundSet['meters_' + m.id];
		});
		$scope.filteredVirtualMeters = ($scope.virtualmeters || []).filter(function(vm){
			return !boundSet['virtualmeters_' + vm.id];
		});
		$scope.filteredOfflineMeters = ($scope.offlinemeters || []).filter(function(om){
			return !boundSet['offlinemeters_' + om.id];
		});

		$scope.changeMeterType();
	};

	$scope.pairMeter=function(dragEl,dropEl){
        var tem_uuid = angular.element('#' + dragEl);
        if (angular.isDefined(tem_uuid.scope().equipmentmeter)) {
            return;
        }
        var modalInstance = $uibModal.open({
            templateUrl: 'views/settings/equipment/equipmentmeter.model.html',
            controller: 'ModalEditEquipmentMeterCtrl',
            backdrop: 'static',
            size: 'sm'
        });
        modalInstance.result.then(function (is_output) {
		    var meterid=angular.element('#'+dragEl).scope().meter.id;
		    var equipmentid=$scope.currentEquipment.id;
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
            EquipmentMeterService.addPair(equipmentid, meterid, $scope.currentMeterType, is_output, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.BIND_METER_SUCCESS"),
						showCloseButton: true,
					});
					// Reacquire the binding and trigger filtering
					$scope.getMetersByEquipmentID($scope.currentEquipment.id);
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant(response.data.title),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
        },function() {
        });
		$rootScope.modalInstance = modalInstance;
    };

    $scope.deleteMeterPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var equipmentmeterid = angular.element('#' + dragEl).scope().equipmentmeter.id;
        var equipmentid = $scope.currentEquipment.id;
        var metertype = angular.element('#' + dragEl).scope().equipmentmeter.metertype;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        EquipmentMeterService.deletePair(equipmentid, equipmentmeterid, metertype, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_METER_SUCCESS"),
                    showCloseButton: true,
                });
                // Reacquire the binding and trigger filtering
                $scope.getMetersByEquipmentID($scope.currentEquipment.id);
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

	$scope.getAllEquipments();
	$scope.getAllMeters();
	$scope.getAllVirtualMeters();
	$scope.getAllOfflineMeters();

  	$scope.$on('handleBroadcastEquipmentChanged', function(event) {
    	$scope.getAllEquipments();
  	});
});

app.controller('ModalEditEquipmentMeterCtrl', function ($scope, $uibModalInstance) {
    $scope.is_output = "false";

    $scope.ok = function () {
        $uibModalInstance.close(angular.fromJson($scope.is_output));
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
