
app.controller('ModalExportCtrl', function($scope, $uibModalInstance, params, toaster, $translate,) {
	$scope.exportdata = params.exportdata;
	$scope.ok = function() {
		let tempInput = document.createElement("input");
		tempInput.value = $scope.exportdata;
		document.body.appendChild(tempInput);
		tempInput.select();
		document.execCommand("copy");
		document.body.removeChild(tempInput);
		toaster.pop({
			type: "success",
			title: $translate.instant("TOASTER.SUCCESS_TITLE"),
			body: $translate.instant("TOASTER.COPY_SUCCESS"),
			showCloseButton: true,
		});
		$uibModalInstance.close($scope.exportdata);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
});