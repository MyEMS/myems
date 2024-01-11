
app.controller('ModalImportCtrl', function($scope, $uibModalInstance, params) {
	$scope.ok = function() {
		$uibModalInstance.close($scope.importdata);
	};

    $scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});