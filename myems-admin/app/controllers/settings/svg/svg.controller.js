'use strict';

app.controller('SVGController', function(
	$scope,
	$rootScope,
	$window,
	$translate,
	$uibModal,
	SVGService,
	toaster,
	SweetAlert) {
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	$scope.exportdata = '';
	$scope.importdata = '';
	$scope.current_svg = null;

	$scope.getAllSVGs = function() {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token, "QUICKMODE": true };
		SVGService.getAllSVGs(headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				$scope.svgs = response.data;
			} else {
				$scope.svgs = [];
			}
		});
	};

	$scope.addSVG = function() {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/settings/svg/svg.model.html',
			controller: 'ModalAddSVGCtrl',
			windowClass: "animated fadeIn",
		});
		modalInstance.result.then(function(svg) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			SVGService.addSVG(svg, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SVG")}),
						showCloseButton: true,
					});
					$scope.getAllSVGs();
					$scope.$emit('handleEmitSVGChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.SVG")}),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.editSVG = function(svg) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SVGService.getSVG(svg.id, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				console.log(response);
				$scope.current_svg = response.data;
				var modalInstance = $uibModal.open({
					windowClass: "animated fadeIn",
					templateUrl: 'views/settings/svg/svg.model.html',
					controller: 'ModalEditSVGCtrl',
					resolve: {
						params: function() {
							return {
								svg: angular.copy($scope.current_svg )
							};
						}
					}
				});

				modalInstance.result.then(function(modifiedSVG) {
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
					SVGService.editSVG(modifiedSVG, headers, function (response) {
						if (angular.isDefined(response.status) && response.status === 200) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {template: $translate.instant("COMMON.SVG")}),
								showCloseButton: true,
							});
							$scope.getAllSVGs();
							$scope.$emit('handleEmitSVGChanged');
						} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.SVG")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
						}
					});
				}, function() {
					//do nothing;
				});
				$rootScope.modalInstance = modalInstance;
			} else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {template: $translate.instant("COMMON.SVG")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.deleteSVG=function(svg){
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
					let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		            SVGService.deleteSVG(svg, headers, function (response) {
		            	if (angular.isDefined(response.status) && response.status === 204) {
							toaster.pop({
								type: "success",
								title: $translate.instant("TOASTER.SUCCESS_TITLE"),
								body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {template: $translate.instant("COMMON.SVG")}),
								showCloseButton: true,
							});
							$scope.getAllSVGs();
          					$scope.$emit('handleEmitSVGChanged');
		            	} else {
							toaster.pop({
								type: "error",
								title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {template: $translate.instant("COMMON.SVG")}),
								body: $translate.instant(response.data.description),
								showCloseButton: true,
							});
		            	}
		            });
		        }
		    });
	};

	$scope.exportSVG = function(svg) {
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SVGService.exportSVG(svg, headers, function(response) {
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

	$scope.cloneSVG = function(svg){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		SVGService.cloneSVG(svg, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SVG")}),
					showCloseButton: true,
				});
				$scope.getAllSVGs();
				$scope.$emit('handleEmitSVGChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.SVG")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

	$scope.importSVG = function() {
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
			SVGService.importSVG(importdata, headers, function(response) {
				if (angular.isDefined(response.status) && response.status === 201) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.SVG")}),
						showCloseButton: true,
					});
					$scope.getAllSVGs();
					$scope.$emit('handleEmitSVGChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_ADD_BODY", { template: $translate.instant("COMMON.SVG") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function() {

		});
		$rootScope.modalInstance = modalInstance;
	};

	$scope.getAllSVGs();
});

app.controller("ModalAddSVGCtrl", function(  $scope,  $uibModalInstance) {
  $scope.operation = "SVG.ADD_SVG";
  $scope.ok = function() {
    $uibModalInstance.close($scope.svg);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
});

app.controller("ModalEditSVGCtrl", function($scope, $uibModalInstance,  params) {
  $scope.operation = "SVG.EDIT_SVG";
  $scope.svg = params.svg;

  $scope.ok = function() {
    $uibModalInstance.close($scope.svg);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
});
