'use strict';

app.controller('FlatController', function($scope,$common,$uibModal,$translate, FlatService,toaster,SweetAlert) {
	
	
	$scope.getAllFlats = function() {
		FlatService.getAllFlats(function(error, data) {
			if (!error) {
				$scope.flats = data;
			} else {
				$scope.flats = [];
			}
		});
		
	};

	$scope.addFlat = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/tariff/flat.model.html',
			controller: 'ModalAddFlatCtrl',
			windowClass: "animated fadeIn",
			resolve: {
		        params:function(){
                    return {
                        flats:angular.copy($scope.flats)
                    };
                }
		    }
		});
		modalInstance.result.then(function(flat) {
			FlatService.addFlat(flat, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "TOASTER.FLAT";
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
					$scope.getAllFlats();
				} else {
					var templateName = "TOASTER.FLAT";
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

	$scope.editFlat=function(flat){
		var modalInstance = $uibModal.open({
		    windowClass: "animated fadeIn",
		    templateUrl: 'views/settings/tariff/flat.model.html',
		    controller: 'ModalEditFlatCtrl',
		    resolve: {
		        params:function(){
                    return {
                        flat:angular.copy(flat),
                        flats:angular.copy($scope.flats)
                    };
                }
		    }
		});

		modalInstance.result.then(function (modifiedFlat) {
	        FlatService.editFlat(modifiedFlat,function(error,status){
	            if(angular.isDefined(status) && status==200){
	                var templateName = "TOASTER.FLAT";
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
	                $scope.getAllFlats();
	            }else{
	                var templateName = "TOASTER.FLAT";
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

	$scope.deleteFlat=function(flat){
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
		            FlatService.deleteFlat(flat, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "TOASTER.FLAT";
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
		            		$scope.getAllFlats();
		            	} else {
		            		var templateName = "TOASTER.FLAT";
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
	
	$scope.getAllFlats();
	

});

app.controller('ModalAddFlatCtrl', function ($scope, $uibModalInstance,params) {

    $scope.operation="添加";
    $scope.flats=params.flats;
    $scope.ok = function () {
        $uibModalInstance.close($scope.flat);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ModalEditFlatCtrl', function ($scope, $uibModalInstance, params) {
    $scope.operation="编辑";
    $scope.flat = params.flat;
    $scope.flats=params.flats;

    $scope.ok = function () {
        $uibModalInstance.close($scope.flat);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});