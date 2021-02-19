'use strict';

app.controller('EquipmentParameterController', function($scope,$common ,$timeout,$uibModal, $translate,	MeterService, VirtualMeterService, OfflineMeterService,	EquipmentParameterService, EquipmentService, PointService, toaster,SweetAlert) {
    $scope.currentEquipment = {selected:undefined};
    $scope.is_show_add_parameter = false;
    $scope.equipments = [];
    $scope.meters = [];
    $scope.offlinemeters = [];
    $scope.virtualmeters = [];
    $scope.mergedMeters = [];

	  $scope.getAllEquipments = function() {
		EquipmentService.getAllEquipments(function(error, data) {
			if (!error) {
				$scope.equipments = data;
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
			EquipmentParameterService.getParametersByEquipmentID(id, function(error, data) {
				if (!error) {
					$scope.equipmentparameters=data;
				}
			});
	};

	$scope.addEquipmentParameter = function() {

		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/equipment/equipmentparameter.model.html',
			controller: 'ModalAddEquipmentParameterCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
            points: angular.copy($scope.points),
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

			EquipmentParameterService.addEquipmentParameter(equipmentid, equipmentparameter, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "EQUIPMENT.PARAMETER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getParametersByEquipmentID($scope.currentEquipment.id);
				} else {
					var templateName = "EQUIPMENT.PARAMETER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_add_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editEquipmentParameter = function(equipmentparameter) {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/equipment/equipmentparameter.model.html',
			controller: 'ModalEditEquipmentParameterCtrl',
  		windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						equipmentparameter: angular.copy(equipmentparameter),
            points: angular.copy($scope.points),
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
			EquipmentParameterService.editEquipmentParameter($scope.currentEquipment.id, modifiedEquipmentParameter, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "EQUIPMENT.PARAMETER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
					$scope.getParametersByEquipmentID($scope.currentEquipment.id);
				} else {
					var templateName = "EQUIPMENT.PARAMETER";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitle = $common.toaster.error_title;
					var popBody = $common.toaster.error_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody,{template: templateName});

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});
				}
			});
		}, function() {
			//do nothing;
		});
	};

	$scope.deleteEquipmentParameter = function(equipmentparameter) {
		SweetAlert.swal({
				title: $translate.instant($common.sweet.title),
				text: $translate.instant($common.sweet.text),
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: $translate.instant($common.sweet.confirmButtonText),
				cancelButtonText: $translate.instant($common.sweet.cancelButtonText),
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function(isConfirm) {
				if (isConfirm) {
					EquipmentParameterService.deleteEquipmentParameter($scope.currentEquipment.id, equipmentparameter.id, function(error, status) {
						if (angular.isDefined(status) && status == 204) {
							var templateName = "EQUIPMENT.PARAMETER";
              templateName = $translate.instant(templateName);

              var popType = 'TOASTER.SUCCESS';
              var popTitle = $common.toaster.success_title;
              var popBody = $common.toaster.success_delete_body;

              popType = $translate.instant(popType);
              popTitle = $translate.instant(popTitle);
              popBody = $translate.instant(popBody, {template: templateName});

              toaster.pop({
                  type: popType,
                  title: popTitle,
                  body: popBody,
                  showCloseButton: true,
              });
							$scope.getParametersByEquipmentID($scope.currentEquipment.id);
						} else if (angular.isDefined(status) && status == 400) {
							var popType = 'TOASTER.ERROR';
              var popTitle = error.title;
              var popBody = error.description;

              popType = $translate.instant(popType);
              popTitle = $translate.instant(popTitle);
              popBody = $translate.instant(popBody);

              toaster.pop({
                  type: popType,
                  title: popTitle,
                  body: popBody,
                  showCloseButton: true,
              });
						} else {
							var templateName = "EQUIPMENT.PARAMETER";
              templateName = $translate.instant(templateName);

              var popType = 'TOASTER.ERROR';
              var popTitle = $common.toaster.error_title;
              var popBody = $common.toaster.error_delete_body;

              popType = $translate.instant(popType);
              popTitle = $translate.instant(popTitle);
              popBody = $translate.instant(popBody, {template: templateName});

              toaster.pop({
                  type: popType,
                  title: popTitle,
                  body: popBody,
                  showCloseButton: true,
              });
				   }
					});
				}
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

	// $scope.changeMeterType=function(){
	// 	switch($scope.currentMeterType){
	// 		case 'meters':
	// 			$scope.currentmeters=$scope.meters;
	// 			break;
	// 		case 'virtualmeters':
	// 			$scope.currentmeters=$scope.virtualmeters;
	// 			break;
	// 		case  'offlinemeters':
	// 			$scope.currentmeters=$scope.offlinemeters;
	// 			break;
	// 	}
	// };

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
    MeterService.getAllMeters(function(error, data) {
			if (!error) {
				$scope.meters = data;
        for(var i = 0; i < $scope.meters.length; i++) {
            var mergedmeter = {"uuid":  $scope.meters[i].uuid, "name": "meter/"+$scope.meters[i].name};
            $scope.mergedmeters.push(mergedmeter);
       }
				// $scope.currentMeterType="meters";
				// $timeout(function(){
				// 	$scope.changeMeterType();
				// },1000);
			} else {
				$scope.meters = [];
			}
		});

    OfflineMeterService.getAllOfflineMeters(function(error, data) {
			if (!error) {
				$scope.offlinemeters = data;
        for(var i = 0; i < $scope.offlinemeters.length; i++) {
            var mergedmeter = {"uuid":  $scope.offlinemeters[i].uuid, "name": "offlinemeter/"+$scope.offlinemeters[i].name};
            $scope.mergedmeters.push(mergedmeter);
       }
			} else {
				$scope.offlinemeters = [];
			}
		});

    VirtualMeterService.getAllVirtualMeters(function(error, data) {
			if (!error) {
				$scope.virtualmeters = data;
        for(var i = 0; i < $scope.virtualmeters.length; i++) {
            var mergedmeter = {"uuid":  $scope.virtualmeters[i].uuid, "name": "virtualmeter/"+$scope.virtualmeters[i].name};
            $scope.mergedmeters.push(mergedmeter);
       }
			} else {
				$scope.virtualmeters = [];
			}
		});

    console.log($scope.mergedmeters);
	};

  $scope.getAllPoints = function() {
  	PointService.getAllPoints(function(error, data) {
  		if (!error) {
        // if (data.length > 0) {
        //   for (var i = 0; i < data.length; i++) {
        //     data[i].name = data[i].data_source.name + "/" + data[i].name ;
        //   }
        // }
  			$scope.points = data;
  		} else {
  			$scope.points = [];
  		}
  	});

  };

	$scope.getAllEquipments();
  $scope.getMergedMeters();
  $scope.getAllPoints();

  $scope.$on('handleBroadcastEquipmentChanged', function(event) {
    $scope.getAllEquipments();
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
