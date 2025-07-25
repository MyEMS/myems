"use strict";

app.controller(
  "EnergyStorageContainerPowerconversionsystemController",
  function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    EnergyStorageContainerService,
    EnergyStorageContainerPowerconversionsystemService,
    EnergyStorageContainerDataSourceService,
	PointService,
    MeterService,
    CommandService,
    toaster,
    SweetAlert
  ) {
    $scope.energystoragecontainers = [];
    $scope.energystoragecontainerpowerconversionsystems = [];
    $scope.meters = [];
    $scope.points = [];
    $scope.commands = [];
    $scope.currentEnergyStorageContainer = null;
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.getAllEnergyStorageContainers = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerService.getAllEnergyStorageContainers(
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragecontainers = response.data;
          } else {
            $scope.energystoragecontainers = [];
          }
        }
      );
    };

    $scope.getDataSourcesByEnergyStorageContainerID = function (id) {
		let headers = {
		  "User-UUID": $scope.cur_user.uuid,
		  Token: $scope.cur_user.token,
		};
		EnergyStorageContainerDataSourceService.getDataSourcesByEnergyStorageContainerID(
		  id,
		  headers,
		  function (response) {
			if (angular.isDefined(response.status) && response.status === 200) {
			  $scope.datasources = response.data;
			} else {
			  $scope.datasources = [];
			}
		  }
		);
	  };

    $scope.getDataSourcePointsByEnergyStorageContainerID = function (id) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerDataSourceService.getDataSourcePointsByEnergyStorageContainerID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.points = response.data;
          } else {
            $scope.points = [];
          }
        }
      );
    };

    $scope.getAllMeters = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      MeterService.getAllMeters(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.meters = response.data;
        } else {
          $scope.meters = [];
        }
      });
    };

    $scope.getAllCommands = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      CommandService.getAllCommands(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.commands = response.data;
        } else {
          $scope.commands = [];
        }
      });
    };
    $scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID =
      function (id) {
        let headers = {
          "User-UUID": $scope.cur_user.uuid,
          Token: $scope.cur_user.token,
        };
        EnergyStorageContainerPowerconversionsystemService.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID(
          id,
          headers,
          function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.energystoragecontainerpowerconversionsystems =
                response.data;
            } else {
              $scope.energystoragecontainerpowerconversionsystems = [];
            }
          }
        );
      };

    $scope.changeEnergyStorageContainer = function (item, model) {
      $scope.currentEnergyStorageContainer = item;
      $scope.currentEnergyStorageContainer.selected = model;
      $scope.is_show_add_energystoragecontainer_powerconversionsystem = true;
      $scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
	  $scope.getDataSourcesByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
	  $scope.getDataSourcePointsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
    };

    $scope.addEnergyStorageContainerPowerconversionsystem = function () {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerpowerconversionsystem.model.html",
        controller: "ModalAddEnergyStorageContainerPowerconversionsystemCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              meters: angular.copy($scope.meters),
              points: angular.copy($scope.points),
              commands: angular.copy($scope.commands),
            };
          },
        },
      });
      modalInstance.result.then(
        function (energystoragecontainerpowerconversionsystem) {
          energystoragecontainerpowerconversionsystem.run_state_point_id =
            energystoragecontainerpowerconversionsystem.run_state_point.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerPowerconversionsystemService.addEnergyStorageContainerPowerconversionsystem(
            $scope.currentEnergyStorageContainer.id,
            energystoragecontainerpowerconversionsystem,
            headers,
            function (response) {
              if (
                angular.isDefined(response.status) &&
                response.status === 201
              ) {
                toaster.pop({
                  type: "success",
                  title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                  body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
				$scope.getDataSourcesByEnergyStorageContainerID(
				  $scope.currentEnergyStorageContainer.id
				);
				$scope.getDataSourcePointsByEnergyStorageContainerID(
				  $scope.currentEnergyStorageContainer.id
				);
                $scope.$emit(
                  "handleEmitEnergyStorageContainerPowerconversionsystemChanged"
                );
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM"
                    ),
                  }),
                  body: $translate.instant(response.data.description),
                  showCloseButton: true,
                });
              }
            }
          );
        },
        function () {}
      );
      $rootScope.modalInstance = modalInstance;
    };

    $scope.bindEnergyStorageContainerPCSPoint = function (
      energystoragecontainerpcs
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerpowerconversionsystempoint.model.html",
        controller: "ModalBindEnergyStorageContainerPCSCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              energystoragecontainerid: $scope.currentEnergyStorageContainer.id,
              energystoragecontainerpcs: angular.copy(
                energystoragecontainerpcs
              ),
              meters: angular.copy($scope.meters),
              datasources: angular.copy($scope.datasources),
              points: angular.copy($scope.points),
            };
          },
        },
      });
      $rootScope.modalInstance = modalInstance;
    };
    $scope.editEnergyStorageContainerPowerconversionsystem = function (
      energystoragecontainerpowerconversionsystem
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerpowerconversionsystem.model.html",
        controller: "ModalEditEnergyStorageContainerPowerconversionsystemCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              energystoragecontainerpowerconversionsystem: angular.copy(
                energystoragecontainerpowerconversionsystem
              ),
              meters: angular.copy($scope.meters),
              points: angular.copy($scope.points),
              commands: angular.copy($scope.commands),
            };
          },
        },
      });

      modalInstance.result.then(
        function (modifiedEnergyStorageContainerPowerconversionsystem) {
          modifiedEnergyStorageContainerPowerconversionsystem.run_state_point_id =
            modifiedEnergyStorageContainerPowerconversionsystem.run_state_point.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerPowerconversionsystemService.editEnergyStorageContainerPowerconversionsystem(
            $scope.currentEnergyStorageContainer.id,
            modifiedEnergyStorageContainerPowerconversionsystem,
            headers,
            function (response) {
              if (
                angular.isDefined(response.status) &&
                response.status === 200
              ) {
                toaster.pop({
                  type: "success",
                  title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                  body: $translate.instant("TOASTER.SUCCESS_UPDATE_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
				$scope.getDataSourcesByEnergyStorageContainerID(
				  $scope.currentEnergyStorageContainer.id
				);
				$scope.getDataSourcePointsByEnergyStorageContainerID(
				  $scope.currentEnergyStorageContainer.id
				);
                $scope.$emit(
                  "handleEmitEnergyStorageContainerPowerconversionsystemChanged"
                );
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM"
                    ),
                  }),
                  body: $translate.instant(response.data.description),
                  showCloseButton: true,
                });
              }
            }
          );
        },
        function () {
          //do nothing;
        }
      );
      $rootScope.modalInstance = modalInstance;
    };

    $scope.deleteEnergyStorageContainerPowerconversionsystem = function (
      energystoragecontainerpowerconversionsystem
    ) {
      SweetAlert.swal(
        {
          title: $translate.instant("SWEET.TITLE"),
          text: $translate.instant("SWEET.TEXT"),
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: $translate.instant("SWEET.CONFIRM_BUTTON_TEXT"),
          cancelButtonText: $translate.instant("SWEET.CANCEL_BUTTON_TEXT"),
          closeOnConfirm: true,
          closeOnCancel: true,
        },
        function (isConfirm) {
          if (isConfirm) {
            let headers = {
              "User-UUID": $scope.cur_user.uuid,
              Token: $scope.cur_user.token,
            };
            EnergyStorageContainerPowerconversionsystemService.deleteEnergyStorageContainerPowerconversionsystem(
              $scope.currentEnergyStorageContainer.id,
              energystoragecontainerpowerconversionsystem.id,
              headers,
              function (response) {
                if (
                  angular.isDefined(response.status) &&
                  response.status === 204
                ) {
                  toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.SUCCESS_DELETE_BODY", {
                      template: $translate.instant(
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM"
                      ),
                    }),
                    showCloseButton: true,
                  });
                  $scope.getEnergyStorageContainerPowerconversionsystemsByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
				  $scope.getDataSourcePointsByEnergyStorageContainerID(
					$scope.currentEnergyStorageContainer.id
				  );
                  $scope.$emit(
                    "handleEmitEnergyStorageContainerPowerconversionsystemChanged"
                  );
                } else {
                  toaster.pop({
                    type: "error",
                    title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {
                      template: $translate.instant(
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM"
                      ),
                    }),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                  });
                }
              }
            );
          }
        }
      );
    };

    $scope.getAllEnergyStorageContainers();
    $scope.getAllMeters();
    $scope.getAllCommands();
    $scope.$on(
      "handleBroadcastEnergyStorageContainerChanged",
      function (event) {
        $scope.getAllEnergyStorageContainers();
      }
    );
  }
);

app.controller(
  "ModalAddEnergyStorageContainerPowerconversionsystemCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM";
    $scope.points = params.points;
    $scope.meters = params.meters;
    $scope.commands = params.commands;
    $scope.ok = function () {
      $uibModalInstance.close(
        $scope.energystoragecontainerpowerconversionsystem
      );
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalEditEnergyStorageContainerPowerconversionsystemCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM";
    $scope.energystoragecontainerpowerconversionsystem =
      params.energystoragecontainerpowerconversionsystem;
    $scope.points = params.points;
    $scope.meters = params.meters;
    $scope.commands = params.commands;
    $scope.ok = function () {
      $uibModalInstance.close(
        $scope.energystoragecontainerpowerconversionsystem
      );
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalBindEnergyStorageContainerPCSCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    EnergyStorageContainerPowerconversionsystemService,
    PointService,
    params
  ) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM";
    $scope.energystoragecontainerid = params.energystoragecontainerid;
    $scope.energystoragecontainerpcs = params.energystoragecontainerpcs;
    $scope.datasources = params.datasources;
    $scope.boundpoints = params.boundpoints;

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    EnergyStorageContainerPowerconversionsystemService.getPointsByPCSID(
      $scope.energystoragecontainerid,
      $scope.energystoragecontainerpcs.id,
      headers,
      function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.boundpoints = response.data;
        } else {
          $scope.boundpoints = [];
        }
      }
    );

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };

    $scope.changeDataSource = function (item, model) {
      console.log("changeDataSource");
      $scope.currentDataSource = model;
      console.log($scope.currentDataSource);
      $scope.getPointsByDataSourceID($scope.currentDataSource);
    };

    $scope.getPointsByDataSourceID = function (id) {
      console.log("getPointsByDataSourceID");
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      PointService.getPointsByDataSourceID(id, headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.points = response.data;
        } else {
          $scope.points = [];
        }
      });
    };

    $scope.pairPoint = function (dragEl, dropEl) {
      var pointid = angular.element("#" + dragEl).scope().point.id;
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      EnergyStorageContainerPowerconversionsystemService.addPair(
        params.energystoragecontainerid,
        params.energystoragecontainerpcs.id,
        pointid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.BIND_POINT_SUCCESS"),
              showCloseButton: true,
            });
            let headers = {
              "User-UUID": params.user_uuid,
              Token: params.token,
            };
            EnergyStorageContainerPowerconversionsystemService.getPointsByPCSID(
              params.energystoragecontainerid,
              params.energystoragecontainerpcs.id,
              headers,
              function (response) {
                if (
                  angular.isDefined(response.status) &&
                  response.status === 200
                ) {
                  $scope.boundpoints = response.data;
                } else {
                  $scope.boundpoints = [];
                }
              }
            );
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };

    $scope.deletePointPair = function (dragEl, dropEl) {
      if (angular.element("#" + dragEl).hasClass("source")) {
        return;
      }

      var pointid = angular.element("#" + dragEl).scope().boundpoint.id;
      let headers = { "User-UUID": params.user_uuid, Token: params.token };
      EnergyStorageContainerPowerconversionsystemService.deletePair(
        params.energystoragecontainerid,
        params.energystoragecontainerpcs.id,
        pointid,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 204) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.UNBIND_POINT_SUCCESS"),
              showCloseButton: true,
            });
            let headers = {
              "User-UUID": params.user_uuid,
              Token: params.token,
            };
            EnergyStorageContainerPowerconversionsystemService.getPointsByPCSID(
              params.energystoragecontainerid,
              params.energystoragecontainerpcs.id,
              headers,
              function (response) {
                if (
                  angular.isDefined(response.status) &&
                  response.status === 200
                ) {
                  $scope.boundpoints = response.data;
                } else {
                  $scope.boundpoints = [];
                }
              }
            );
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant(response.data.title),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };
  }
);
