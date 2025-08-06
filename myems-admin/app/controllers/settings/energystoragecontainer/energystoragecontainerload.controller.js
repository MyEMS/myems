"use strict";

app.controller(
  "EnergyStorageContainerLoadController",
  function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    EnergyStorageContainerService,
    EnergyStorageContainerLoadService,
    EnergyStorageContainerDataSourceService,
    PointService,
    MeterService,
    toaster,
    SweetAlert
  ) {
    $scope.energystoragecontainers = [];
    $scope.energystoragecontainerloads = [];
    $scope.points = [];
    $scope.meters = [];
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
    $scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID = function (
      id
    ) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerLoadService.getEnergyStorageContainerLoadsByEnergyStorageContainerID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragecontainerloads = response.data;
          } else {
            $scope.energystoragecontainerloads = [];
          }
        }
      );
    };

    $scope.changeEnergyStorageContainer = function (item, model) {
      $scope.currentEnergyStorageContainer = item;
      $scope.currentEnergyStorageContainer.selected = model;
      $scope.is_show_add_energystoragecontainer_load = true;
      $scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
      $scope.getDataSourcesByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
      $scope.getDataSourcePointsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
    };

    $scope.addEnergyStorageContainerLoad = function () {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerload.model.html",
        controller: "ModalAddEnergyStorageContainerLoadCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              meters: angular.copy($scope.meters),
              points: angular.copy($scope.points),
            };
          },
        },
      });
      modalInstance.result.then(
        function (energystoragecontainerload) {
          energystoragecontainerload.power_point_id =
            energystoragecontainerload.power_point.id;
          energystoragecontainerload.meter_id =
            energystoragecontainerload.meter.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerLoadService.addEnergyStorageContainerLoad(
            $scope.currentEnergyStorageContainer.id,
            energystoragecontainerload,
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
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcePointsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.$emit("handleEmitEnergyStorageContainerLoadChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD"
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

    $scope.editEnergyStorageContainerLoad = function (
      energystoragecontainerload
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerload.model.html",
        controller: "ModalEditEnergyStorageContainerLoadCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              energystoragecontainerload: angular.copy(
                energystoragecontainerload
              ),
              meters: angular.copy($scope.meters),
              points: angular.copy($scope.points),
            };
          },
        },
      });

      modalInstance.result.then(
        function (modifiedEnergyStorageContainerLoad) {
          modifiedEnergyStorageContainerLoad.power_point_id =
            modifiedEnergyStorageContainerLoad.power_point.id;
          modifiedEnergyStorageContainerLoad.meter_id =
            modifiedEnergyStorageContainerLoad.meter.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerLoadService.editEnergyStorageContainerLoad(
            $scope.currentEnergyStorageContainer.id,
            modifiedEnergyStorageContainerLoad,
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
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcePointsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.$emit("handleEmitEnergyStorageContainerLoadChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD"
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

    $scope.bindEnergyStorageContainerLoadPoint = function (
      energystoragecontainerload
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerloadpoint.model.html",
        controller: "ModalBindEnergyStorageContainerLoadCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              energystoragecontainerid: $scope.currentEnergyStorageContainer.id,
              energystoragecontainerload: angular.copy(
                energystoragecontainerload
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
    $scope.deleteEnergyStorageContainerLoad = function (
      energystoragecontainerload
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
            EnergyStorageContainerLoadService.deleteEnergyStorageContainerLoad(
              $scope.currentEnergyStorageContainer.id,
              energystoragecontainerload.id,
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
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD"
                      ),
                    }),
                    showCloseButton: true,
                  });
                  $scope.getEnergyStorageContainerLoadsByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.getDataSourcesByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.getDataSourcePointsByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.$emit("handleEmitEnergyStorageContainerLoadChanged");
                } else {
                  toaster.pop({
                    type: "error",
                    title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {
                      template: $translate.instant(
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_LOAD"
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
    $scope.$on(
      "handleBroadcastEnergyStorageContainerChanged",
      function (event) {
        $scope.getAllEnergyStorageContainers();
      }
    );
  }
);

app.controller(
  "ModalAddEnergyStorageContainerLoadCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_LOAD";
    $scope.points = params.points;
    $scope.meters = params.meters;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainerload);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalEditEnergyStorageContainerLoadCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_LOAD";
    $scope.energystoragecontainerload = params.energystoragecontainerload;
    $scope.points = params.points;
    $scope.meters = params.meters;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainerload);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalBindEnergyStorageContainerLoadCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    EnergyStorageContainerLoadService,
    PointService,
    params
  ) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_LOAD";
    $scope.energystoragecontainerid = params.energystoragecontainerid;
    $scope.energystoragecontainerload = params.energystoragecontainerload;
    $scope.datasources = params.datasources;
    $scope.boundpoints = params.boundpoints;

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    EnergyStorageContainerLoadService.getPointsByLoadID(
      $scope.energystoragecontainerid,
      $scope.energystoragecontainerload.id,
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
      EnergyStorageContainerLoadService.addPair(
        params.energystoragecontainerid,
        params.energystoragecontainerload.id,
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
            EnergyStorageContainerLoadService.getPointsByLoadID(
              params.energystoragecontainerid,
              params.energystoragecontainerload.id,
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
      EnergyStorageContainerLoadService.deletePair(
        params.energystoragecontainerid,
        params.energystoragecontainerload.id,
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
            EnergyStorageContainerLoadService.getPointsByLoadID(
              params.energystoragecontainerid,
              params.energystoragecontainerload.id,
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
