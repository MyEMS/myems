'use strict';

app.controller('LoginController', function (
	$translate,
	$timeout,
	$location,
	$window,
	$uibModal,
	$scope,
	$rootScope,
	$cookies,
	$interval,
	LoginService,
	UserService,
	WebMessageService,
	toaster) {

	$scope.dataLoading = false;
	$scope.isFullScreen = false;
	$scope.language = $window.localStorage.getItem("myems_admin_ui_language") || "zh_CN"; //zh_CN, en, de, fr, es, ru, ar, vi, th, tr, ms, id, zh_TW, pt
	$scope.fullScreenTitle = "FULLSCREEN";
	$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
	// login section start
	$scope.login = function (user, captcha, captchaText, refreshCaptcha) {
		if(captcha.toLowerCase() !== captchaText.toLowerCase()){
			$scope.captcha = '';
			refreshCaptcha();
			toaster.pop({
				type: "error",
				title: $translate.instant('TOASTER.CAPTCHA_ERROR'),
				body: '',
				showCloseButton: true,
			});
			return false;
		}
		$scope.dataLoading = true;
		LoginService.login(user, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				if (!response.data.is_admin) {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_TITLE"),
						body: $translate.instant('TOASTER.LOGIN_FAILURE_WITHOUT_ADMIN'),
						showCloseButton: true,
					});
					$scope.dataLoading = false;
					return;
				}
				// toaster type options: 'error','info','wait','success','warning'
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant('TOASTER.LOGIN_SUCCESS'),
					showCloseButton: true,
				});
				$window.localStorage.setItem("myems_admin_ui_current_user", JSON.stringify(response.data));

				$scope.createCookie('is_logged_in', true, 1000 * 60 * 5 * 1);
				$location.path('/settings/space');
				$scope.cur_user = JSON.parse($window.localStorage.getItem("myems_admin_ui_current_user"));
			} else {
				toaster.pop({
					type: "error",
					title: $translate.instant('TOASTER.LOGIN_FAILURE'),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
			refreshCaptcha();
			$scope.dataLoading = false;
		});
	};

	$scope.logout = function () {
		// close modal modalInstance(if present)
		if ($rootScope.modalInstance) {
			$rootScope.modalInstance.close();
		}
		let data = null;
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		LoginService.logout(data, headers, function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant('TOASTER.LOGOUT_SUCCESS'),
					showCloseButton: true,
				});
				$window.localStorage.removeItem("myems_admin_ui_current_user");
				$location.path('/login');
			} else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.LOGOUT_FAILURE"),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
				$window.localStorage.removeItem("myems_admin_ui_current_user");
				$location.path('/login');
			}
		});
	};

	$scope.onKeypress = function ($event) {
		if ($event.charCode == 13) {
			$scope.login($scope.user);
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
				new_password: user.new_password
			};

			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };

			UserService.changePassword(data, headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					toaster.pop({
						type: "success",
						title: $translate.instant("TOASTER.SUCCESS_TITLE"),
						body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", { template: $translate.instant("TOASTER.USER_PASSWORD") }),
						showCloseButton: true,
					});
					$scope.$emit('handleEmitLineChanged');
				} else {
					toaster.pop({
						type: "error",
						title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", { template: $translate.instant("TOASTER.USER_PASSWORD") }),
						body: $translate.instant(response.data.description),
						showCloseButton: true,
					});
				}
			});
		}, function () {
			//do nothing;
		});
		$rootScope.modalInstance = modalInstance;
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
		$window.localStorage.setItem("myems_admin_ui_language", langKey);
	};

	// web message alarm section start
	$scope.webmessages = [];
	$scope.getWebMessage = function () {
		if ($scope.cur_user != null && $scope.cur_user.uuid != null && $scope.cur_user.token != null) {
			let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
			WebMessageService.getStatusNewResult(headers, function (response) {
				if (angular.isDefined(response.status) && response.status === 200) {
					$scope.webmessages = response.data;
				}
			});
		}
	};

	$scope.createCookie = (name, value, cookieExpireTime) => {
		const date = new Date();
		date.setTime(date.getTime() + cookieExpireTime);
		const expires = '; expires=' + date.toUTCString();
		document.cookie = name + '=' + value + expires + '; path=/';
	};

	$scope.getTime = function () {
		if ($cookies.get('is_logged_in') == null || $cookies.get('is_logged_in') == undefined ) {
			$scope.logout();
		}
	};

	// web message alarm section end

	$scope.fullscreenChangeHandle();
	$scope.getWebMessage();
	$interval.cancel();

	if ($location.$$path.indexOf('login') == -1 && $location.$$path.indexOf('dashboard') == -1) {
		$scope.refresh = $interval($scope.getWebMessage, 1000 * 60 * 1);
	};

	if ($location.$$path.indexOf('login') == -1) {
		$scope.isLoggedIn = $interval($scope.getTime, 1000 * 1 * 1);
	}

	document.mousemove = () => {
		$scope.createCookie('is_logged_in', true, 1000 * 60 * 5 * 1);
	};
	document.mousedown = () => {
		$scope.createCookie('is_logged_in', true, 1000 * 60 * 5 * 1);
	};
	$window.addEventListener("mousemove", document.mousemove);
	$window.addEventListener("mousedown", document.mousedown);

	$scope.$on('$destroy', function () {
		if (angular.isDefined($scope.refresh)) {
			$interval.cancel($scope.refresh);
			$interval.cancel($scope.isLoggedIn);
			$window.removeEventListener("mousemove", document.mousemove);
			$window.removeEventListener("mousedown", document.mousedown);
			$cookies.remove("is_logged_in")
			$scope.refresh = undefined;
		}
	});

	$scope.$on('BroadcastResetWebMessage', function (event) {
		$scope.getWebMessage();
	});

});
