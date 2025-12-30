'use strict';

app.controller('EquipmentParameterController', function(
    $scope,
    $rootScope,
    $window,
    $uibModal,
    $translate,
    $timeout,
    MeterService,
    VirtualMeterService,
    OfflineMeterService,
    EquipmentParameterService,
    EquipmentService,
    EquipmentDataSourceService,
    PointService,
    toaster,SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
    $scope.currentEquipment = {selected:undefined};
    $scope.is_show_add_parameter = false;
    $scope.equipments = [];
    $scope.meters = [];
    $scope.offlinemeters = [];
    $scope.virtualmeters = [];
    $scope.mergedMeters = [];

	$scope.getAllEquipments = function() {
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
    	$scope.is_show_add_parameter = true;
		$scope.getParametersByEquipmentID($scope.currentEquipment.id);
	};

	$scope.getParametersByEquipmentID = function(id) {
		$scope.equipmentparameters=[];
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EquipmentParameterService.getParametersByEquipmentID(id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.equipmentparameters = response.data;
			}
		});
	};

    $scope.addEquipmentParameter = function() {
        $scope.getAddPoints().then(function() {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/settings/equipment/equipmentparameter.model.html',
                controller: 'ModalAddEquipmentParameterCtrl',
                windowClass: "animated fadeIn",
                resolve: {
                    params: function() {
                        return {
                            points: angular.copy($scope.add_points),
                            mergedmeters: angular.copy($scope.mergedmeters),
                        };
                    }
                }
            });
            modalInstance.result.then(function(equipmentparameter) {
                var equipmentid = $scope.currentEquipment.id;
                if (equipmentparameter.point != null) {
                    equipmentparameter.point_id = equipmentparameter.point.id;
                }
                if (equipmentparameter.numerator_meter != null) {
                    equipmentparameter.numerator_meter_uuid = equipmentparameter.numerator_meter.uuid;
                }
                if (equipmentparameter.denominator_meter != null) {
                    equipmentparameter.denominator_meter_uuid = equipmentparameter.denominator_meter.uuid;
                }
                let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
                EquipmentParameterService.addEquipmentParameter(equipmentid, equipmentparameter, headers, function (response) {
                    if (angular.isDefined(response.status) && response.status === 201) {
                        toaster.pop({
                            type: "success",
                            title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                            body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("EQUIPMENT.PARAMETER")}),
                            showCloseButton: true,
                        });
                        $scope.getParametersByEquipmentID($scope.currentEquipment.id);
                    } else {
                        toaster.pop({
                            type: "error",
                            title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("EQUIPMENT.PARAMETER")}),
                            body: $translate.instant(response.data.description),
                            showCloseButton: true,
                        });
                    }
                });
            }, function() {

            });
            $rootScope.modalInstance = modalInstance;
        })
    };

	$scope.editEquipmentParameter = function(equipmentparameter) {
            $scope.getEditPoints(equipmentparameter).then(function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/equipment/equipmentparameter.model.html',
			controller: 'ModalEditEquipmentParameterCtrl',
  		        windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						equipmentparameter: angular.copy(equipmentparameter),
						points: angular.copy($scope.edit_points),
						mergedmeters: angular.copy($scope.mergedmeters),
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedEquipmentParameter) {
			if (modifiedEquipmentParameter.point != null) {
					modifiedEquipmentParameter.point_id = modifiedEquipmentParameter.point.id;
			}
			if (modifiedEquipmentParameter.numerator_meter != null) {
					modifiedEquipmentParameter.numerator_meter_uuid = modifiedEquipmentParameter.numerator_meter.uuid;
			}
			if (modifiedEquipmentParameter.denominator_meter != null) {
					modifiedEquipmentParameter.denominator_meter_uuid = modifiedEquipmentParameter.denominator_meter.uuid;
			}
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			EquipmentParameterService.editEquipmentParameter($scope.currentEquipment.id,
			    modifiedEquipmentParameter, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("EQUIPMENT.PARAMETER")}),
						showCloseButton: true,
					});
					$scope.getParametersByEquipmentID($scope.currentEquipment.id);
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("EQUIPMENT.PARAMETER")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
		$rootScope.modalInstance = modalInstance;
            })
	};

	$scope.deleteEquipmentParameter = function(equipmentparameter) {
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
			function(isConfirm) {
				if (isConfirm) {
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
					EquipmentParameterService.deleteEquipmentParameter($scope.currentEquipment.id,
					    equipmentparameter.id, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("EQUIPMENT.PARAMETER")}),
								showCloseButton: true,
							});
							$scope.getParametersByEquipmentID($scope.currentEquipment.id);
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("EQUIPMENT.PARAMETER")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
				   		}
					});
				}
			}
		);
	};

	$scope.colorMeterType = function(type) {
		if (type === 'meters') {
			return 'btn-primary'
		} else if (type === 'virtualmeters') {
			return 'btn-info'
		} else {
			return 'btn-success'
		}
	};

	$scope.showEquipmentParameterType = function(type) {
		if (type == 'constant') {
			return 'EQUIPMENT.CONSTANT';
		} else if (type == 'point' ) {
			return 'EQUIPMENT.POINT';
		} else if (type == 'fraction') {
				return 'EQUIPMENT.FRACTION';
		}
	};

	$scope.showEquipmentParameterNumerator = function(equipmentparameter) {
		if (equipmentparameter.numerator_meter == null) {
			return '-';
		} else {
			return '(' + equipmentparameter.numerator_meter.type + ')' + equipmentparameter.numerator_meter.name;
		}
	};


	$scope.showEquipmentParameterDenominator = function(equipmentparameter) {
		if (equipmentparameter.denominator_meter == null) {
			return '-';
		} else {
			return '(' + equipmentparameter.denominator_meter.type + ')' + equipmentparameter.denominator_meter.name;
		}
	};

	$scope.getMergedMeters = function() {
		$scope.mergedmeters = [];
		$scope.meters = [];
		$scope.offlinemeters = [];
		$scope.virtualmeters = [];
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		MeterService.getAllMeters(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.meters = response.data;
				for(var i = 0; i < $scope.meters.length; i++) {
					var mergedmeter = {"uuid":  $scope.meters[i].uuid, "name": "meter/"+$scope.meters[i].name};
					$scope.mergedmeters.push(mergedmeter);
				}
			} else {
				$scope.meters = [];
			}
	});

	OfflineMeterService.getAllOfflineMeters(headers, function (response) {
		if (angular.isDefined(response.status) && response.status === 200) {
			$scope.offlinemeters = response.data;
			for(var i = 0; i < $scope.offlinemeters.length; i++) {
				var mergedmeter = {"uuid":  $scope.offlinemeters[i].uuid, "name": "offlinemeter/"+$scope.offlinemeters[i].name};
				$scope.mergedmeters.push(mergedmeter);
			}
		} else {
			$scope.offlinemeters = [];
		}
	});

    VirtualMeterService.getAllVirtualMeters(headers, function (response) {
		if (angular.isDefined(response.status) && response.status === 200) {
			$scope.virtualmeters = response.data;
			for(var i = 0; i < $scope.virtualmeters.length; i++) {
				var mergedmeter = {"uuid":  $scope.virtualmeters[i].uuid, "name": "virtualmeter/"+$scope.virtualmeters[i].name};
				$scope.mergedmeters.push(mergedmeter);
			}
		} else {
			$scope.virtualmeters = [];
		}
	});

	};

	$scope.getAllPoints = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		PointService.getAllPoints(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.points = response.data;
			} else {
				$scope.points = [];
			}
		});

	};

        $scope.getAddPoints = function() {
            return new Promise(function(resolve, reject) {
                let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
                EquipmentDataSourceService.getAddPoints($scope.currentEquipment.id, headers, function (response) {
                    if (angular.isDefined(response.status) && response.status === 200) {
                        $scope.add_points = response.data;
                        resolve($scope.add_points);
                    } else {
                        $scope.add_points = [];
                        resolve($scope.add_points);
                    }
                }, function(error) {
                    $scope.add_points = [];
                    reject(error);
                });
            });
        };

	$scope.getEditPoints = function(equipmentparameter) {
            return new Promise(function(resolve, reject) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EquipmentDataSourceService.getEditPoints($scope.currentEquipment.id, equipmentparameter.id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.edit_points = response.data;
                                resolve($scope.edit_points);
			} else {
				$scope.edit_points = [];
                                resolve($scope.edit_points);
			}
		});
            });
	};

	$scope.tabInitialized = false;

	$scope.initTab = function() {
		if (!$scope.tabInitialized) {
			$scope.tabInitialized = true;
			$scope.getAllEquipments();
			$scope.getMergedMeters();
			$scope.getAllPoints();
		}
	};

	$scope.$on('equipment.tabSelected', function(event, tabIndex) {
		if ($scope.$parent && $scope.$parent.TAB_INDEXES && tabIndex === $scope.$parent.TAB_INDEXES.BIND_PARAMETER && !$scope.tabInitialized) {
			$scope.initTab();
		}
	});

	$timeout(function() {
		if ($scope.$parent && $scope.$parent.TAB_INDEXES && $scope.$parent.activeTabIndex === $scope.$parent.TAB_INDEXES.BIND_PARAMETER && !$scope.tabInitialized) {
			$scope.initTab();
		}
	}, 0);

	$scope.$on('handleBroadcastEquipmentChanged', function(event) {
		if ($scope.tabInitialized) {
			$scope.getAllEquipments();
		}
  	});
});


app.controller('ModalAddEquipmentParameterCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "EQUIPMENT.ADD_PARAMETER";
	$scope.equipmentparameter = {
      parameter_type : "constant",
  	};
	$scope.is_disabled = false;
	$scope.points = params.points;
	$scope.mergedmeters = params.mergedmeters;
	$scope.ok = function() {
		$uibModalInstance.close($scope.equipmentparameter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditEquipmentParameterCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "EQUIPMENT.EDIT_PARAMETER";
	$scope.equipmentparameter = params.equipmentparameter;
	$scope.points = params.points;
	$scope.mergedmeters = params.mergedmeters;
	$scope.is_disabled = true;
	$scope.ok = function() {
		$uibModalInstance.close($scope.equipmentparameter);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
