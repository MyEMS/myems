'use strict';

app.controller('RuleController', function(
    $scope,
    $rootScope,
    $window,
    $uibModal,
    $translate,
    RuleService,
    toaster,
    SweetAlert) {
    $scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';

	$scope.initExpression = [{
		"sample_object_id": 1,
		"limit": 1000.000,
		"recipients": [{
			"user_id": "1"
		}]
	}];

	$scope.initMessageTemplate = '$s1';

	$scope.getAllRules = function() {
        let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		RuleService.getAllRules(headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.rules = response.data;
			} else {
				$scope.rules = [];
			}
		});

	};

	$scope.addRule = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/fdd/rule.model.html',
			controller: 'ModalAddRuleCtrl',
			windowClass: "animated fadeIn",
			size: 'xl',
			resolve: {
				params: function() {
					return {
						rules: angular.copy($scope.rules),
						expression:angular.copy($scope.initExpression),
						message_template:angular.copy($scope.initMessageTemplate)
					};
				}
			}
		});
		modalInstance.result.then(function(rule) {
		    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			RuleService.addRule(rule, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("FDD.RULE")}),
						showCloseButton: true,
					});
					$scope.getAllRules();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY",{template: $translate.instant("FDD.RULE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editRule = function(rule) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/fdd/rule.model.html',
			controller: 'ModalEditRuleCtrl',
			size: 'xl',
			resolve: {
				params: function() {
					return {
						rule: angular.copy(rule)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedRule) {
		    let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			RuleService.editRule(modifiedRule, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY",{template: $translate.instant("FDD.RULE")}),
						showCloseButton: true,
					});
					$scope.getAllRules();
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("FDD.RULE")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});

				}
			});
		}, function() {
			//do nothing;
		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.deleteRule = function(rule) {
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
                    RuleService.deleteRule(rule, headers, function (response) {
                        if (angular.isDefined(response.status) && response.status === 204) {
                            toaster.pop({
                                type: "success",
                                title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                                body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", { template: $translate.instant("FDD.RULE") }),
                                showCloseButton: true,
                            });
                            $scope.getAllRules();
                        } else {
                            toaster.pop({
                                type: "error",
                                title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("FDD.RULE")}),
                                body: $translate.instant(response.data.description),
                                showCloseButton: true,
                            });
						}
					});
				}
			});
	};

	$scope.runRule = function (rule) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
        RuleService.runRule(rule, headers, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant('TOASTER.SUCCESS_TITLE'),
                    body: $translate.instant('FDD.RUN_SUBMITTED'),
                    showCloseButton: true,
                });
                $scope.getAllRules();
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

	$scope.exportRule = function(rule) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		RuleService.exportRule(rule, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.exportdata = JSON.stringify(response.data);
				var modalInstance = $uibModal.open({
					windowClass: "animated fadeIn",
					templateUrl: 'views/common/export.html',
					controller: 'ModalExportCtrl',
					resolve: {
						params: function() {
							return {
								exportdata: angular.copy($scope.exportdata)
							};
						}
					}
				});
				modalInstance.result.then(function() {
					//do nothing;
				}, function() {
					//do nothing;
				});
				$rootScope.modalInstance = modalInstance;
			} else {
				$scope.exportdata = null;
			}
		});
	};

	$scope.cloneRule = function(rule){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		RuleService.cloneRule(rule, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("FDD.RULE")}),
					showCloseButton: true,
				});
				$scope.getAllRules();
				$scope.$emit('handleEmitRuleChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("FDD.RULE")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importRule = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/common/import.html',
			controller: 'ModalImportCtrl',
			windowClass: "animated fadeIn",
			resolve: {
				params: function() {
					return {
					};
				}
			}
		});
		modalInstance.result.then(function(importdata) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			RuleService.importRule(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("FDD.RULE")}),
						showCloseButton: true,
					});
					$scope.getAllRules();
					$scope.$emit('handleEmitRuleChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("FDD.RULE") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllRules();

});

app.controller('ModalAddRuleCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "FDD.ADD_RULE";
	$scope.rule={};
	$scope.rule.is_enabled=true;
	$scope.rule.channel='WEB';
	$scope.rule.expression=JSON.stringify(params.expression);
	$scope.rule.message_template=params.message_template;

	$scope.updateFddCodeOptions = function () {
		if ($scope.rule.category === 'SYSTEM') {
			$scope.fddCodeOptions = ['SYSTEM01', 'SYSTEM02'];
		} else if ($scope.rule.category === 'REALTIME') {
			$scope.fddCodeOptions = ['REALTIME01', 'REALTIME02'];
		} else if ($scope.rule.category === 'SPACE') {
			$scope.fddCodeOptions = ['SPACE01', 'SPACE02', 'SPACE03', 'SPACE04'];
		} else if ($scope.rule.category === 'METER') {
			$scope.fddCodeOptions = ['METER01', 'METER02', 'METER03', 'METER04', 'METER05', 'METER06', 'METER07'];
		} else if ($scope.rule.category === 'TENANT') {
			$scope.fddCodeOptions = ['TENANT01', 'TENANT02', 'TENANT03', 'TENANT04'];
		} else if ($scope.rule.category === 'STORE') {
			$scope.fddCodeOptions = ['STORE01', 'STORE02', 'STORE03', 'STORE04'];
		} else if ($scope.rule.category === 'SHOPFLOOR') {
			$scope.fddCodeOptions = ['SHOPFLOOR01', 'SHOPFLOOR02', 'SHOPFLOOR03', 'SHOPFLOOR04'];
		} else if ($scope.rule.category === 'EQUIPMENT') {
			$scope.fddCodeOptions = ['EQUIPMENT01', 'EQUIPMENT02', 'EQUIPMENT03', 'EQUIPMENT04'];
		} else if ($scope.rule.category === 'COMBINEDEQUIPMENT') {
			$scope.fddCodeOptions = ['COMBINEDEQUIPMENT01', 'COMBINEDEQUIPMENT02', 'COMBINEDEQUIPMENT03', 'COMBINEDEQUIPMENT04'];
		} else if ($scope.rule.category === 'VIRTUALMETER') {
			$scope.fddCodeOptions = ['VIRTUALMETER01', 'VIRTUALMETER02', 'VIRTUALMETER03', 'VIRTUALMETER04'];
		} else if ($scope.rule.category === 'DIGITALPOINT') {
			$scope.fddCodeOptions = ['DIGITALPOINT01'];
		}
	};

	$scope.ok = function() {
		$uibModalInstance.close($scope.rule);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('ModalEditRuleCtrl', function($scope, $uibModalInstance, params) {
	$scope.operation = "FDD.EDIT_RULE";
	$scope.rule = params.rule;
	$scope.rule.is_enabled = params.rule.is_enabled;

	$scope.updateFddCodeOptions = function () {
		if ($scope.rule.category === 'SYSTEM') {
			$scope.fddCodeOptions = ['SYSTEM01', 'SYSTEM02'];
		} else if ($scope.rule.category === 'REALTIME') {
			$scope.fddCodeOptions = ['REALTIME01', 'REALTIME02'];
		} else if ($scope.rule.category === 'SPACE') {
			$scope.fddCodeOptions = ['SPACE01', 'SPACE02', 'SPACE03', 'SPACE04'];
		} else if ($scope.rule.category === 'METER') {
			$scope.fddCodeOptions = ['METER01', 'METER02', 'METER03', 'METER04', 'METER05', 'METER06', 'METER07'];
		} else if ($scope.rule.category === 'TENANT') {
			$scope.fddCodeOptions = ['TENANT01', 'TENANT02', 'TENANT03', 'TENANT04'];
		} else if ($scope.rule.category === 'STORE') {
			$scope.fddCodeOptions = ['STORE01', 'STORE02', 'STORE03', 'STORE04'];
		} else if ($scope.rule.category === 'SHOPFLOOR') {
			$scope.fddCodeOptions = ['SHOPFLOOR01', 'SHOPFLOOR02', 'SHOPFLOOR03', 'SHOPFLOOR04'];
		} else if ($scope.rule.category === 'EQUIPMENT') {
			$scope.fddCodeOptions = ['EQUIPMENT01', 'EQUIPMENT02', 'EQUIPMENT03', 'EQUIPMENT04'];
		} else if ($scope.rule.category === 'COMBINEDEQUIPMENT') {
			$scope.fddCodeOptions = ['COMBINEDEQUIPMENT01', 'COMBINEDEQUIPMENT02', 'COMBINEDEQUIPMENT03', 'COMBINEDEQUIPMENT04'];
		} else if ($scope.rule.category === 'VIRTUALMETER') {
			$scope.fddCodeOptions = ['VIRTUALMETER01', 'VIRTUALMETER02', 'VIRTUALMETER03', 'VIRTUALMETER04'];
		} else if ($scope.rule.category === 'DIGITALPOINT') {
			$scope.fddCodeOptions = ['DIGITALPOINT01'];
		}
	};

	// init
	$scope.updateFddCodeOptions();
	$scope.ok = function() {
		$uibModalInstance.close($scope.rule);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
