'use strict';

app.controller('LoginController', function ($rootScope,
	$translate,
	$timeout,
	$location,
	$window,
	$common,
	$uibModal,
	$cookies,
	$scope,
	$interval,
	LoginService,
	UserService,
	WebMessageAnalysisService,
	toaster) {

	$scope.dataLoading = false;
	$scope.isFullScreen = false;
	$scope.language = $window.localStorage.getItem("language") || 'cn';
	$scope.fullScreenTitle = "FULLSCREEN";
	$scope.cur_user = JSON.parse($window.localStorage.getItem("currentUser"));
	// login section start
	$scope.login = function (user) {
		$scope.dataLoading = true;
		LoginService.login(user, function (response, error, status, headers) {
			if (angular.isDefined(status) && status == 200) {

				var popType = 'TOASTER.SUCCESS';
				var popTitle = $common.toaster.success_title;
				var popBody = 'TOASTER.LOGIN_SUCCESS';

				popType = $translate.instant(popType);
				popTitle = $translate.instant(popTitle);
				popBody = $translate.instant(popBody);

				toaster.pop({
					type: popType,
					title: popTitle,
					body: popBody,
					showCloseButton: true,
				});

				$window.localStorage.setItem("currentUser", JSON.stringify(response));
				// $rootScope.cookie=$cookies.get('user_uuid');
				$location.path('/settings/space');
				$scope.cur_user = JSON.parse($window.localStorage.getItem("currentUser"));
			} else if (angular.isDefined(status) && status == 400 || status == 404) {

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

				var popType = 'TOASTER.ERROR';
				var popTitle = $common.toaster.error_title;
				var popBody = 'TOASTER.LOGIN_FAILURE';

				popType = $translate.instant(popType);
				popTitle = $translate.instant(popTitle);
				popBody = $translate.instant(popBody);

				toaster.pop({
					type: popType,
					title: popTitle,
					body: popBody,
					showCloseButton: true,
				});
			}
			$scope.dataLoading = false;
		});
	};

	$scope.logout = function () {
		let data = null;
		let headers = {
			User_UUID: $scope.cur_user.uuid, 
			Token: $scope.cur_user.token };
		LoginService.logout(data, headers, function (error, status, headers) {
			if (angular.isDefined(status) && status == 200) {
				var popType = 'TOASTER.SUCCESS';
				var popTitle = $common.toaster.success_title;
				var popBody = 'TOASTER.LOGIN_SUCCESS';

				popType = $translate.instant(popType);
				popTitle = $translate.instant(popTitle);
				popBody = $translate.instant(popBody);

				toaster.pop({
					type: popType,
					title: popTitle,
					body: popBody,
					showCloseButton: true,
				});

				$window.localStorage.removeItem("currentUser");
				$location.path('/login');
			} else {
				var popType = 'TOASTER.ERROR';
				var popTitle = $common.toaster.error_title;
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
				$window.localStorage.removeItem("currentUser");
				$location.path('/login');
			}
		});
	};

	$scope.onKeypress = function ($event) {
		if ($event.charCode == 13) {
			$scope.login($scope.user);
		} else {
			return;
		}
	};

	// login section end

	// change pwd section start
	$scope.changePwd = function () {
		var modalInstance = $uibModal.open({
			windowClass: "animated fadeIn",
			templateUrl: 'views/users/user/change-password.model.html',
			controller: 'ModalChangePasswordCtrl',
			resolve: {
				params: function () {
					return {
						user: angular.copy($scope.cur_user)
					};
				}
			}
		});

		modalInstance.result.then(function (user) {
			let data = {
				old_password: user.old_password, 
				new_password: user.new_password };

			let headers = {
				User_UUID: $scope.cur_user.uuid, 
				Token: $scope.cur_user.token };
			
			UserService.changePassword(data, headers, function (error, status) {
				if (angular.isDefined(status) && status == 200) {
					var templateName = "TOASTER.USER_PASSWORD";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.SUCCESS';
					var popTitle = $common.toaster.success_title;
					var popBody = $common.toaster.success_update_body;

					popType = $translate.instant(popType);
					popTitle = $translate.instant(popTitle);
					popBody = $translate.instant(popBody, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitle,
						body: popBody,
						showCloseButton: true,
					});

					$scope.$emit('handleEmitLineChanged');
				} else {
					var templateName = "TOASTER.USER_PASSWORD";
					templateName = $translate.instant(templateName);

					var popType = 'TOASTER.ERROR';
					var popTitleOne = error.title;
					var popTitleTwo = $common.toaster.error_title;
					var popBodyOne = error.description;
					var popBodyTwo = $common.toaster.error_update_body;

					popType = $translate.instant(popType);
					popTitleOne = $translate.instant(popTitleOne);
					popTitleTwo = $translate.instant(popTitleTwo);
					popBodyOne = $translate.instant(popBodyOne, { template: templateName });
					popBodyTwo = $translate.instant(popBodyTwo, { template: templateName });

					toaster.pop({
						type: popType,
						title: popTitleOne || popTitleTwo,
						body: popBodyOne || popBodyTwo,
						showCloseButton: true,
					});

					// toaster.pop({
					// 	type: 'error',
					// 	title: error.title || $common.toaster.error_title,
					// 	body: error.description || $common.toaster.error_update_body.format('user password'),
					// 	showCloseButton: true,
					// });
				}
			});
		}, function () {
			//do nothing;
		});
	};
	// change pwd section end

	// full screen section start
	document.onwebkitfullscreenchange = function (e) {
		$scope.fullscreenChangeHandle();
	};

	document.onmozfullscreenchange = function (e) {
		$scope.fullscreenChangeHandle();
	};

	document.MSFullscreenChange = function (e) {
		$scope.fullscreenChangeHandle();
	};

	document.onfullscreenchange = function (e) {
		$scope.fullscreenChangeHandle();
	};

	$scope.fullscreenChangeHandle = function () {
		$scope.isFullScreen = document.fullScreen ||
			document.mozFullScreen ||
			document.webkitIsFullScreen;
		if ($scope.isFullScreen) {
			$timeout(function () {
				$scope.fullScreenTitle = "EXITFULLSCREEN";
			}, 0)
		} else {
			$timeout(function () {
				$scope.fullScreenTitle = "FULLSCREEN";
			}, 0)
		}
	};

	$scope.fullscreen = function () {
		var docElm = document.documentElement;
		$scope.isFullScreen = document.fullScreen ||
			document.mozFullScreen ||
			document.webkitIsFullScreen;
		if ($scope.isFullScreen) {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		} else {
			if (docElm.requestFullscreen) {
				docElm.requestFullscreen();
			} else if (docElm.msRequestFullscreen) {
				docElm = document.body;
				docElm.msRequestFullscreen();
			} else if (docElm.mozRequestFullScreen) {
				docElm.mozRequestFullScreen();
			} else if (docElm.webkitRequestFullScreen) {
				docElm.webkitRequestFullScreen();
			}
		}

	};

	// full screen section end.

	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
		$scope.language = langKey;
		$window.localStorage.setItem("language", langKey);
	};

	// web message alarm section start
	$scope.webmessages = [];
	$scope.getWebMessage = function () {
		WebMessageAnalysisService.getStatusNewResult(function (error, data) {
			if (!error) {
				$scope.webmessages = data;
			}
		});
	};

	// web message alarm section end

	$scope.fullscreenChangeHandle();
	$scope.getWebMessage();
	$interval.cancel();

	if ($location.$$path.indexOf('login') == -1 && $location.$$path.indexOf('dashboard') == -1) {
		$scope.refresh = $interval($scope.getWebMessage, 1000 * 60 * 1);
	};

	$scope.$on('$destroy', function () {
		if (angular.isDefined($scope.refresh)) {
			$interval.cancel($scope.refresh);
			$scope.refresh = undefined;
		}
	});

	$scope.$on('BroadcastResetWebMessage', function (event) {
		$scope.getWebMessage();
	});

});
