"use strict";

app.controller(
  "EnergyStorageContainerBatteryController",
  function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    EnergyStorageContainerService,
    EnergyStorageContainerBatteryService,
    EnergyStorageContainerDataSourceService,
    PointService,
    MeterService,
    toaster,
    SweetAlert
  ) {
    $scope.energystoragecontainers = [];
    $scope.energystoragecontainerbatteries = [];
    $scope.datasources = [];
    $scope.points = [];
    $scope.boundpoints = [];
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

    $scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID =
      function (id) {
        let headers = {
          "User-UUID": $scope.cur_user.uuid,
          Token: $scope.cur_user.token,
        };
        EnergyStorageContainerBatteryService.getEnergyStorageContainerBatteriesByEnergyStorageContainerID(
          id,
          headers,
          function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.energystoragecontainerbatteries = response.data;
            } else {
              $scope.energystoragecontainerbatteries = [];
            }
          }
        );
      };

    $scope.changeEnergyStorageContainer = function (item, model) {
      $scope.currentEnergyStorageContainer = item;
      $scope.currentEnergyStorageContainer.selected = model;
      $scope.is_show_add_energystoragecontainer_battery = true;
      $scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
      $scope.getDataSourcesByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
      $scope.getDataSourcePointsByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
    };

    $scope.addEnergyStorageContainerBattery = function () {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerbattery.model.html",
        controller: "ModalAddEnergyStorageContainerBatteryCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              meters: angular.copy($scope.meters),
              datasources: angular.copy($scope.datasources),
              points: angular.copy($scope.points),
            };
          },
        },
      });
      modalInstance.result.then(
        function (energystoragecontainerbattery) {
          energystoragecontainerbattery.battery_state_point_id =
            energystoragecontainerbattery.battery_state_point.id;
          energystoragecontainerbattery.soc_point_id =
            energystoragecontainerbattery.soc_point.id;
          energystoragecontainerbattery.power_point_id =
            energystoragecontainerbattery.power_point.id;
          energystoragecontainerbattery.charge_meter_id =
            energystoragecontainerbattery.charge_meter.id;
          energystoragecontainerbattery.discharge_meter_id =
            energystoragecontainerbattery.discharge_meter.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerBatteryService.addEnergyStorageContainerBattery(
            $scope.currentEnergyStorageContainer.id,
            energystoragecontainerbattery,
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
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcePointsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.$emit("handleEmitEnergyStorageContainerBatteryChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY"
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

    $scope.editEnergyStorageContainerBattery = function (
      energystoragecontainerbattery
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerbattery.model.html",
        controller: "ModalEditEnergyStorageContainerBatteryCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              energystoragecontainerbattery: angular.copy(
                energystoragecontainerbattery
              ),
              meters: angular.copy($scope.meters),
              datasources: angular.copy($scope.datasources),
              points: angular.copy($scope.points),
            };
          },
        },
      });

      modalInstance.result.then(
        function (modifiedEnergyStorageContainerBattery) {
          modifiedEnergyStorageContainerBattery.battery_state_point_id =
            modifiedEnergyStorageContainerBattery.battery_state_point.id;
          modifiedEnergyStorageContainerBattery.soc_point_id =
            modifiedEnergyStorageContainerBattery.soc_point.id;
          modifiedEnergyStorageContainerBattery.power_point_id =
            modifiedEnergyStorageContainerBattery.power_point.id;
          modifiedEnergyStorageContainerBattery.charge_meter_id =
            modifiedEnergyStorageContainerBattery.charge_meter.id;
          modifiedEnergyStorageContainerBattery.discharge_meter_id =
            modifiedEnergyStorageContainerBattery.discharge_meter.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerBatteryService.editEnergyStorageContainerBattery(
            $scope.currentEnergyStorageContainer.id,
            modifiedEnergyStorageContainerBattery,
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
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcesByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.getDataSourcePointsByEnergyStorageContainerID(
                  $scope.currentEnergyStorageContainer.id
                );
                $scope.$emit("handleEmitEnergyStorageContainerBatteryChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {
                    template: $translate.instant(
                      "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY"
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
    $scope.bindEnergyStorageContainerBatteryPoint = function (
      energystoragecontainerbattery
    ) {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainerbatterypoint.model.html",
        controller: "ModalBindEnergyStorageContainerBatteryCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              user_uuid: $scope.cur_user.uuid,
              token: $scope.cur_user.token,
              energystoragecontainerid: $scope.currentEnergyStorageContainer.id,
              energystoragecontainerbattery: angular.copy(
                energystoragecontainerbattery
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
    $scope.deleteEnergyStorageContainerBattery = function (
      energystoragecontainerbattery
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
            EnergyStorageContainerBatteryService.deleteEnergyStorageContainerBattery(
              $scope.currentEnergyStorageContainer.id,
              energystoragecontainerbattery.id,
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
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY"
                      ),
                    }),
                    showCloseButton: true,
                  });
                  $scope.getEnergyStorageContainerBatteriesByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.getDataSourcesByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.getDataSourcePointsByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.$emit(
                    "handleEmitEnergyStorageContainerBatteryChanged"
                  );
                } else {
                  toaster.pop({
                    type: "error",
                    title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {
                      template: $translate.instant(
                        "ENERGY_STORAGE_CONTAINER.ENERGY_STORAGE_CONTAINER_BATTERY"
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
  "ModalAddEnergyStorageContainerBatteryCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_BATTERY";
    $scope.datasources = params.datasources;
    $scope.points = params.points;
    $scope.meters = params.meters;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainerbattery);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalEditEnergyStorageContainerBatteryCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_BATTERY";
    $scope.energystoragecontainerbattery = params.energystoragecontainerbattery;
    $scope.datasources = params.datasources;
    $scope.points = params.points;
    $scope.meters = params.meters;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainerbattery);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalBindEnergyStorageContainerBatteryCtrl",
  function (
    $scope,
    $uibModalInstance,
    toaster,
    $translate,
    EnergyStorageContainerBatteryService,
    PointService,
    params
  ) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_BATTERY";
    $scope.energystoragecontainerid = params.energystoragecontainerid;
    $scope.energystoragecontainerbattery = params.energystoragecontainerbattery;
    $scope.datasources = params.datasources;
    $scope.boundpoints = params.boundpoints;

    let headers = { "User-UUID": params.user_uuid, Token: params.token };
    EnergyStorageContainerBatteryService.getPointsByBMSID(
      $scope.energystoragecontainerid,
      $scope.energystoragecontainerbattery.id,
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
      EnergyStorageContainerBatteryService.addPair(
        params.energystoragecontainerid,
        params.energystoragecontainerbattery.id,
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
            EnergyStorageContainerBatteryService.getPointsByBMSID(
              params.energystoragecontainerid,
              params.energystoragecontainerbattery.id,
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
      EnergyStorageContainerBatteryService.deletePair(
        params.energystoragecontainerid,
        params.energystoragecontainerbattery.id,
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
            EnergyStorageContainerBatteryService.getPointsByBMSID(
              params.energystoragecontainerid,
              params.energystoragecontainerbattery.id,
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
