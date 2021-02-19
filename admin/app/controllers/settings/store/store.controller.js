'use strict';

app.controller('StoreController', function($scope,$common,$translate,$uibModal, CostCenterService, ContactService, StoreService, StoreTypeService, toaster,SweetAlert) {

	$scope.getAllCostCenters = function() {
		CostCenterService.getAllCostCenters(function(error, data) {
			if (!error) {
				$scope.costcenters = data;
			} else {
				$scope.costcenters = [];
			}
		});
	};

	$scope.getAllContacts = function() {
		ContactService.getAllContacts(function(error, data) {
			if (!error) {
				$scope.contacts = data;
			} else {
				$scope.contacts = [];
			}
		});
	};

	$scope.getAllStores = function() {
		StoreService.getAllStores(function(error, data) {
			if (!error) {
				$scope.stores = data;
			} else {
				$scope.stores = [];
			}
		});
	};

$scope.getAllStoreTypes = function() {
	StoreTypeService.getAllStoreTypes(function(error, data) {
		if (!error) {
			$scope.storetypes = data;
		} else {
			$scope.storetypes = [];
		}
	});
};
	$scope.addStore = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/store/store.model.html',
			controller: 'ModalAddStoreCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
						stores:angular.copy($scope.stores),
						storetypes: angular.copy($scope.storetypes),
						costcenters: angular.copy($scope.costcenters),
						contacts: angular.copy($scope.contacts),
					};
				}
			}
		});
		modalInstance.result.then(function(store) {
	    	store.store_type_id=store.store_type.id;
			store.cost_center_id=store.cost_center.id;
			store.contact_id=store.contact.id;
			if (angular.isDefined(store.is_input_counted) == false) {
				store.is_input_counted = false;
			}
			StoreService.addStore(store, function(error, status) {
				if (angular.isDefined(status) && status == 201) {

					var templateName = "COMMON.STORE";
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

					$scope.$emit('handleEmitStoreChanged');
				} else {
					var templateName = "COMMON.STORE";
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

	$scope.editStore = function(store) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/settings/store/store.model.html',
			controller: 'ModalEditStoreCtrl',
			resolve: {
				params: function() {
					return {
						store: angular.copy(store),
						storetypes:angular.copy($scope.storetypes),
						costcenters:angular.copy($scope.costcenters),
						contacts:angular.copy($scope.contacts)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedStore) {
	    modifiedStore.store_type_id=modifiedStore.store_type.id;
			modifiedStore.cost_center_id=modifiedStore.cost_center.id;
			modifiedStore.contact_id=modifiedStore.contact.id;
			if (angular.isDefined(store.is_input_counted) == false) {
				store.is_input_counted = false;
			}
			StoreService.editStore(modifiedStore, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "COMMON.STORE";
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
					$scope.$emit('handleEmitStoreChanged');
				} else {
					var templateName = "COMMON.STORE";
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

	$scope.deleteStore=function(store){
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
		            StoreService.deleteStore(store, function(error, status) {
		            	if (angular.isDefined(status) && status == 204) {
		            		var templateName = "COMMON.STORE";
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
		            		$scope.$emit('handleEmitStoreChanged');
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
						}else {
		            		var templateName = "COMMON.STORE";
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
  $scope.getAllStores();
  $scope.getAllStoreTypes();
	$scope.getAllCostCenters();
	$scope.getAllContacts();
	$scope.$on('handleBroadcastStoreChanged', function(event) {
  	$scope.getAllStores();
	});
});

app.controller('ModalAddStoreCtrl', function($scope, $uibModalInstance,params) {

	$scope.operation = "SETTING.ADD_STORE";
	$scope.storetypes=params.storetypes;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.ok = function() {
		$uibModalInstance.close($scope.store);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditStoreCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "SETTING.EDIT_STORE";
	$scope.store = params.store;
	$scope.storetypes=params.storetypes;
	$scope.costcenters=params.costcenters;
	$scope.contacts=params.contacts;
	$scope.ok = function() {
		$uibModalInstance.close($scope.store);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
