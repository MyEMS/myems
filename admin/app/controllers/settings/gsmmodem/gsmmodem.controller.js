'use strict';

app.controller('GSMModemController', function($scope, $translate,$uibModal, GSMModemService,toaster,SweetAlert) {

	$scope.getAllGSMModems = function() {
		GSMModemService.getAllGSMModems(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.gsmmodems = response.data;
			} else {
				$scope.gsmmodems = [];
			}
		});

	};

	$scope.addGSMModem = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/gsmmodem/gsmmodem.model.html',
			controller: 'ModalAddGSMModemCtrl',
			windowClass: "animated fadeIn",
			resolve: {
		        params:function(){
                    return {
                        gsmmodems:angular.copy($scope.gsmmodems)
                    };
                }
		    }
		});
		modalInstance.result.then(function(gsmmodem) {
			GSMModemService.addGSMModem(gsmmodem, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("SETTING.GSM_MODEM")}),
						showCloseButton: true,
					});
					$scope.getAllGSMModems();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("SETTING.GSM_MODEM")}),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
	};

	$scope.editGSMModem=function(gsmmodem){
		var modalInstance = $uibModal.open({
		    windowClass: "animated fadeIn",
		    templateUrl: 'views/settings/gsmmodem/gsmmodem.model.html',
		    controller: 'ModalEditGSMModemCtrl',
		    resolve: {
		        params:function(){
                    return {
                        gsmmodem:angular.copy(gsmmodem),
                        gsmmodems:angular.copy($scope.gsmmodems)
                    };
                }
		    }
		});

		modalInstance.result.then(function (modifiedGSMModem) {
	        GSMModemService.editGSMModem(modifiedGSMModem,function (response){
	            if(angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("SETTING.GSM_MODEM")}),
						showCloseButton: true,
					});
	            	$scope.getAllGSMModems();
	            }else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.FAILURE_TITLE"),
						body: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("SETTING.GSM_MODEM")}),
						showCloseButton: true,
					});
	            }
	        });
		}, function () {
	        //do nothing;
		});
	};

	$scope.deleteGSMModem=function(gsmmodem){
		SweetAlert.swal({
		        title: $translate.instant("SWEET.TITLE"),
		        text: $translate.instant("SWEET.TEXT"),
		        type: "warning",
		        showCancelButton: true,
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
		        cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
		        closeOnConfirm: true,
		        closeOnCancel: true },
		    function (isConfirm) {
		        if (isConfirm) {
		            GSMModemService.deleteGSMModem(gsmmodem, function(response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("SETTING.GSM_MODEM")}),
                                showCloseButton: true,
                            });
		            		$scope.getAllGSMModems();
		            	} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.FAILURE_TITLE"),
                                body: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("SETTING.GSM_MODEM")}),
                                showCloseButton: true,
                            });
		            	}
		            });
		        }
		    });
	};

	$scope.getAllGSMModems();
});

app.controller('ModalAddGSMModemCtrl', function ($scope, $uibModalInstance,params) {

    $scope.operation="SETTING.ADD_GSM_MODEM";
    $scope.gsmmodems=params.gsmmodems;
    $scope.ok = function () {
        $uibModalInstance.close($scope.gsmmodem);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditGSMModemCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation="SETTING.EDIT_GSM_MODEM";
    $scope.gsmmodem = params.gsmmodem;
    $scope.gsmmodems=params.gsmmodems;

    $scope.ok = function () {
        $uibModalInstance.close($scope.gsmmodem);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
