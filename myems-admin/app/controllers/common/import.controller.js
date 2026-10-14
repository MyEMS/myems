
app.controller('ModalImportCtrl', function($scope, $uibModalInstance, params) {
	$scope.description = params.description;
	$scope.description_more = params.description_more;
	$scope.importTemplate = params.import_template;
	$scope.importTemplateHint = params.import_template_hint;
	$scope.useImportTemplate = function() {
		$scope.importdata = $scope.importTemplate;
	};
	$scope.ok = function() {
		$uibModalInstance.close($scope.importdata);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});