'use strict';

app.controller('FlatController', function($scope,$uibModal,$translate, FlatService,toaster,SweetAlert) {
	
	
	$scope.getAllFlats = function() {
		FlatService.getAllFlats(function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.flats = response.data;
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
			FlatService.addFlat(flat, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("TOASTER.FLAT")}),
						showCloseButton: true,
					});
					$scope.getAllFlats();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("TOASTER.FLAT")}),
						body: $translate.instant(response.data.description),
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
	        FlatService.editFlat(modifiedFlat, function (response) {
	            if(angular.isDefined(response.status) && response.status === 200){
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("TOASTER.FLAT")}),
						showCloseButton: true,
					});
	                $scope.getAllFlats();
	            }else{
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("TOASTER.FLAT")}),
						body: $translate.instant(response.data.description),
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
		            FlatService.deleteFlat(flat, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("TOASTER.FLAT")}),
                                showCloseButton: true,
                            });
		            		$scope.getAllFlats();
		            	} else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("TOASTER.FLAT")}),
                                body: $translate.instant(response.data.description),
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