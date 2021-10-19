'use strict';

app.controller('RuleController', function($scope, $uibModal, $translate, RuleService, toaster, SweetAlert) {

	$scope.initExpression = [{
		"sample_object_id": 1,
		"limit": 1000.000,
		"recipients": [{
			"user_id": "1"
		}]
	}];

	$scope.initMessageTemplate = 'This a sample template. Use %s for substitution. You can use multiple %s s in the template.';

	$scope.getAllRules = function() {
		RuleService.getAllRules(function (response) {
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
			size: 'lg',
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
			RuleService.addRule(rule, function (response) {
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
	};

	$scope.editRule = function(rule) {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/fdd/rule.model.html',
			controller: 'ModalEditRuleCtrl',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						rule: angular.copy(rule)
					};
				}
			}
		});

		modalInstance.result.then(function(modifiedRule) {
			RuleService.editRule(modifiedRule, function (response) {
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
                    RuleService.deleteRule(rule, function (response) {
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

	$scope.getAllRules();

});

app.controller('ModalAddRuleCtrl', function($scope, $uibModalInstance, params) {

	$scope.operation = "FDD.ADD_RULE";
	$scope.rule={};
	$scope.rule.is_enabled=true;
	$scope.rule.channel='WEB';
	$scope.rule.expression=JSON.stringify(params.expression);
	$scope.rule.message_template=params.message_template;

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

	$scope.ok = function() {
		$uibModalInstance.close($scope.rule);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});
