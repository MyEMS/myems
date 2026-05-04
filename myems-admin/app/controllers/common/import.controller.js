
app.controller('ModalImportCtrl', function($scope, $uibModalInstance, params) {
	$scope.description = params.description;
	$scope.description_more = params.description_more;
	$scope.ok = function() {
		$uibModalInstance.close($scope.importdata);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});