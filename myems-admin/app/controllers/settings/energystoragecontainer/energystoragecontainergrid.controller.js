"use strict";

app.controller(
  "EnergyStorageContainerGridController",
  function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    EnergyStorageContainerService,
    EnergyStorageContainerGridService,
    EnergyStorageContainerDataSourceService,
    PointService,
    MeterService,
    toaster,
    SweetAlert
  ) {
    $scope.energystoragecontainers = [];
    $scope.energystoragecontainergrids = [];
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
    $scope.getEnergyStorageContainerGridsByEnergyStorageContainerID = function (
      id
    ) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerGridService.getEnergyStorageContainerGridsByEnergyStorageContainerID(
        id,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
            $scope.energystoragecontainergrids = response.data;
          } else {
            $scope.energystoragecontainergrids = [];
          }
        }
      );
    };

    $scope.changeEnergyStorageContainer = function (item, model) {
      $scope.currentEnergyStorageContainer = item;
      $scope.currentEnergyStorageContainer.selected = model;
      $scope.is_show_add_energystoragecontainer_grid = true;
      $scope.getEnergyStorageContainerGridsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
      $scope.getDataSourcesByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
      $scope.getDataSourcePointsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
    };

    $scope.addEnergyStorageContainerGrid = function () {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainergrid.model.html",
        controller: "ModalAddEnergyStorageContainerGridCtrl",
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
        function (energystoragecontainergrid) {
          energystoragecontainergrid.power_point_id =
            energystoragecontainergrid.power_point.id;
          energystoragecontainergrid.buy_meter_id =
            energystoragecontainergrid.buy_meter.id;
          energystoragecontainergrid.sell_meter_id =
            energystoragecontainergrid.sell_meter.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerGridService.addEnergyStorageContainerGrid(
            $scope.currentEnergyStorageContainer.id,
            energystoragecontainergrid,
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
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerGridsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcePointsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.$emit("handleEmitEnergyStorageContainerGridChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID"
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

    $scope.editEnergyStorageContainerGrid = function (
      energystoragecontainergrid
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainergrid.model.html",
        controller: "ModalEditEnergyStorageContainerGridCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              energystoragecontainergrid: angular.copy(
                energystoragecontainergrid
              ),
              meters: angular.copy($scope.meters),
              points: angular.copy($scope.points),
            };
          },
        },
      });

      modalInstance.result.then(
        function (modifiedEnergyStorageContainerGrid) {
          modifiedEnergyStorageContainerGrid.power_point_id =
            modifiedEnergyStorageContainerGrid.power_point.id;
          modifiedEnergyStorageContainerGrid.buy_meter_id =
            modifiedEnergyStorageContainerGrid.buy_meter.id;
          modifiedEnergyStorageContainerGrid.sell_meter_id =
            modifiedEnergyStorageContainerGrid.sell_meter.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerGridService.editEnergyStorageContainerGrid(
            $scope.currentEnergyStorageContainer.id,
            modifiedEnergyStorageContainerGrid,
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
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerGridsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcePointsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.$emit("handleEmitEnergyStorageContainerGridChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID"
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

    $scope.bindEnergyStorageContainerGridPoint = function (
      energystoragecontainergrid
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainergridpoint.model.html",
        controller: "ModalBindEnergyStorageContainerGridCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              energystoragecontainerid: $scope.currentEnergyStorageContainer.id,
              energystoragecontainergrid: angular.copy(
                energystoragecontainergrid
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
    $scope.deleteEnergyStorageContainerGrid = function (
      energystoragecontainergrid
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
            EnergyStorageContainerGridService.deleteEnergyStorageContainerGrid(
              $scope.currentEnergyStorageContainer.id,
              energystoragecontainergrid.id,
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
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID"
                      ),
                    }),
                    showCloseButton: true,
                  });
                  $scope.getEnergyStorageContainerGridsByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.getDataSourcesByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.getDataSourcePointsByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.$emit("handleEmitEnergyStorageContainerGridChanged");
                } else {
                  toaster.pop({
                    type: "error",
                    title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {
                      template: $translate.instant(
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_GRID"
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
  "ModalAddEnergyStorageContainerGridCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_GRID";
    $scope.points = params.points;
    $scope.meters = params.meters;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainergrid);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalEditEnergyStorageContainerGridCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_GRID";
    $scope.energystoragecontainergrid = params.energystoragecontainergrid;
    $scope.points = params.points;
    $scope.meters = params.meters;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainergrid);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalBindEnergyStorageContainerGridCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    EnergyStorageContainerGridService,
    PointService,
    params
  ) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_GRID";
    $scope.energystoragecontainerid = params.energystoragecontainerid;
    $scope.energystoragecontainergrid = params.energystoragecontainergrid;
    $scope.datasources = params.datasources;
    $scope.boundpoints = params.boundpoints;

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    EnergyStorageContainerGridService.getPointsByGridID(
      $scope.energystoragecontainerid,
      $scope.energystoragecontainergrid.id,
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
      EnergyStorageContainerGridService.addPair(
        params.energystoragecontainerid,
        params.energystoragecontainergrid.id,
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
            EnergyStorageContainerGridService.getPointsByGridID(
              params.energystoragecontainerid,
              params.energystoragecontainergrid.id,
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
      EnergyStorageContainerGridService.deletePair(
        params.energystoragecontainerid,
        params.energystoragecontainergrid.id,
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
            EnergyStorageContainerGridService.getPointsByGridID(
              params.energystoragecontainerid,
              params.energystoragecontainergrid.id,
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
