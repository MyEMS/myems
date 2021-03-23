'use strict';

app.controller('RuleController', function($scope, $common, $uibModal, $translate, RuleService, toaster, SweetAlert) {

	$scope.initExpression = [{
		"sample_object_id": 1,
		"limit": 1000.000,
		"recipients": [{
			"user_id": "1"
		}]
	}];

	$scope.initMessageTemplate = 'This a sample template. Use %s for substitution. You can use multiple %s s in the template.';

	$scope.getAllRules = function() {
		RuleService.getAllRules(function(error, data) {
			if (!error) {
				$scope.rules = data;
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
			RuleService.addRule(rule, function(error, status) {
				if (angular.isDefined(status) && status == 201) {
					var templateName = "FDD.RULE";
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
					$scope.getAllRules();
				} else {
					var templateName = "FDD.RULE";
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
			RuleService.editRule(modifiedRule, function(error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "FDD.RULE";
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

					$scope.getAllRules();
				} else {
					var templateName = "FDD.RULE";
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

	$scope.deleteRule = function(rule) {
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
                    RuleService.deleteRule(rule, function (error, status) {
                        if (angular.isDefined(status) && status == 204) {
                            var templateName = "FDD.RULE";
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

                            $scope.getAllRules();
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
                            var templateName = "FDD.RULE";
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
