'use strict';

app.controller('GSMModemController', function($scope,$common, $translate,$uibModal, GSMModemService,toaster,SweetAlert) {


	$scope.getAllGSMModems = function() {
		GSMModemService.getAllGSMModems(function(error, data) {
			if (!error) {
				$scope.gsmmodems = data;
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
			GSMModemService.addGSMModem(gsmmodem, function(error, status) {
				if (angular.isDefined(status) && status == 201) {

					var templateName = "SETTING.GSM_MODEM";
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


					$scope.getAllGSMModems();
				} else {
					var templateName = "SETTING.GSM_MODEM";
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
	        GSMModemService.editGSMModem(modifiedGSMModem,function(error,status){
	            if(angular.isDefined(status) && status==200){
	            	var templateName = "SETTING.GSM_MODEM";
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


	            $scope.getAllGSMModems();
	            }else{
	                var templateName = "SETTING.GSM_MODEM";
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
		}, function () {
	        //do nothing;
		});
	};

	$scope.deleteGSMModem=function(gsmmodem){
		SweetAlert.swal({
		        title: $translate.instant($common.sweet.title),
		        text: $translate.instant($common.sweet.text),
		        type: "warning",
		        showCancelButton: true,
		        confirmButtonColor: "#DD6B55",
		        confirmButtonText: $translate.instant($common.sweet.confirmButtonText),
		        cancelButtonText: $translate.instant($common.sweet.cancelButtonText),
		        closeOnConfirm: true,
		        closeOnCancel: true },
		    function (isConfirm) {
		        if (isConfirm) {
		            GSMModemService.deleteGSMModem(gsmmodem, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "SETTING.GSM_MODEM";
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
		            		$scope.getAllGSMModems();
		            	} else {
		            		var templateName = "SETTING.GSM_MODEM";
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
