"use strict";

app.controller(
  "EnergyStorageContainerSTSController",
  function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    EnergyStorageContainerService,
    EnergyStorageContainerSTSService,
    EnergyStorageContainerDataSourceService,
    PointService,
    toaster,
    SweetAlert
  ) {
    $scope.energystoragecontainers = [];
    $scope.energystoragecontainerstses = [];
    $scope.points = [];
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

    $scope.getEnergyStorageContainerSTSesByEnergyStorageContainerID = function (
      id
    ) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerSTSService.getEnergyStorageContainerSTSesByEnergyStorageContainerID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragecontainerstses = response.data;
          } else {
            $scope.energystoragecontainerstses = [];
          }
        }
      );
    };

    $scope.changeEnergyStorageContainer = function (item, model) {
      $scope.currentEnergyStorageContainer = item;
      $scope.currentEnergyStorageContainer.selected = model;
      $scope.is_show_add_energystoragecontainer_sts = true;
      $scope.getEnergyStorageContainerSTSesByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
      $scope.getDataSourcesByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
      $scope.getDataSourcePointsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
    };

    $scope.addEnergyStorageContainerSTS = function () {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainersts.model.html",
        controller: "ModalAddEnergyStorageContainerSTSCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              points: angular.copy($scope.points),
            };
          },
        },
      });
      modalInstance.result.then(
        function (energystoragecontainersts) {
          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerSTSService.addEnergyStorageContainerSTS(
            $scope.currentEnergyStorageContainer.id,
            energystoragecontainersts,
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
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_STS"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerSTSesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcePointsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.$emit("handleEmitEnergyStorageContainerSTSChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_STS"
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

    $scope.editEnergyStorageContainerSTS = function (
      energystoragecontainersts
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainersts.model.html",
        controller: "ModalEditEnergyStorageContainerSTSCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              energystoragecontainersts: angular.copy(
                energystoragecontainersts
              ),
              points: angular.copy($scope.points),
            };
          },
        },
      });

      modalInstance.result.then(
        function (modifiedEnergyStorageContainerSTS) {
          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerSTSService.editEnergyStorageContainerSTS(
            $scope.currentEnergyStorageContainer.id,
            modifiedEnergyStorageContainerSTS,
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
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_STS"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerSTSesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcePointsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.$emit("handleEmitEnergyStorageContainerSTSChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_STS"
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
    $scope.bindEnergyStorageContainerSTSPoint = function (
      energystoragecontainersts
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerstspoint.model.html",
        controller: "ModalBindEnergyStorageContainerSTSCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              energystoragecontainerid: $scope.currentEnergyStorageContainer.id,
              energystoragecontainersts: angular.copy(
                energystoragecontainersts
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

    $scope.deleteEnergyStorageContainerSTS = function (
      energystoragecontainersts
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
            EnergyStorageContainerSTSService.deleteEnergyStorageContainerSTS(
              $scope.currentEnergyStorageContainer.id,
              energystoragecontainersts.id,
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
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_STS"
                      ),
                    }),
                    showCloseButton: true,
                  });
                  $scope.getEnergyStorageContainerSTSesByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.getDataSourcesByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.getDataSourcePointsByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.$emit("handleEmitEnergyStorageContainerSTSChanged");
                } else {
                  toaster.pop({
                    type: "error",
                    title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {
                      template: $translate.instant(
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_STS"
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
    $scope.$on(
      "handleBroadcastEnergyStorageContainerChanged",
      function (event) {
        $scope.getAllEnergyStorageContainers();
      }
    );
  }
);

app.controller(
  "ModalAddEnergyStorageContainerSTSCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_STS";
    $scope.points = params.points;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainersts);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalEditEnergyStorageContainerSTSCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_STS";
    $scope.energystoragecontainersts = params.energystoragecontainersts;
    $scope.points = params.points;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainersts);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalBindEnergyStorageContainerSTSCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    EnergyStorageContainerSTSService,
    PointService,
    params
  ) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_STS";
    $scope.energystoragecontainerid = params.energystoragecontainerid;
    $scope.energystoragecontainersts = params.energystoragecontainersts;
    $scope.datasources = params.datasources;
    $scope.boundpoints = params.boundpoints;

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    EnergyStorageContainerSTSService.getPointsBySTSID(
      $scope.energystoragecontainerid,
      $scope.energystoragecontainersts.id,
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
      EnergyStorageContainerSTSService.addPair(
        params.energystoragecontainerid,
        params.energystoragecontainersts.id,
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
            EnergyStorageContainerSTSService.getPointsBySTSID(
              params.energystoragecontainerid,
              params.energystoragecontainersts.id,
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
      EnergyStorageContainerSTSService.deletePair(
        params.energystoragecontainerid,
        params.energystoragecontainersts.id,
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
            EnergyStorageContainerSTSService.getPointsBySTSID(
              params.energystoragecontainerid,
              params.energystoragecontainersts.id,
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
