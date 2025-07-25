"use strict";

app.controller(
  "EnergyStorageContainerScheduleController",
  function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    PEAK_TYPE,
    EnergyStorageContainerService,
    EnergyStorageContainerScheduleService,
    toaster,
    SweetAlert
  ) {
    $scope.energystoragecontainers = [];
    $scope.energystoragecontainerschedules = [];
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
    $scope.energystoragecontainerschedules = [];
    $scope.t = {};
    $scope.t.start_hour = "00";
    $scope.t.start_min = "00";
    $scope.t.start_second = "00";
    $scope.t.end_hour = "23";
    $scope.t.end_min = "59";
    $scope.t.end_second = "59";
    $scope.t.peak_type = "midpeak";
    $scope.t.power = 50;

    $scope.showPeakType = function (type) {
      return PEAK_TYPE[type];
    };

    $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID =
      function (id) {
        let headers = {
          "User-UUID": $scope.cur_user.uuid,
          Token: $scope.cur_user.token,
        };
        EnergyStorageContainerScheduleService.getEnergyStorageContainerSchedulesByEnergyStorageContainerID(
          id,
          headers,
          function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
              $scope.energystoragecontainerschedules = response.data;
            } else {
              $scope.energystoragecontainerschedules = [];
            }
          }
        );
      };

    $scope.changeEnergyStorageContainer = function (item, model) {
      $scope.currentEnergyStorageContainer = item;
      $scope.currentEnergyStorageContainer.selected = model;
      $scope.is_show_add_energystoragecontainer_schedule = true;
      $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID(
        $scope.currentEnergyStorageContainer.id
      );
    };

    $scope.addEnergyStorageContainerSchedule = function (t) {
      if (t.peak_type == null || t.power == null || t.peak_type == "") {
        return false;
      }
      t.start_time_of_day =
        t.start_hour + ":" + t.start_min + ":" + t.start_second;
      t.end_time_of_day = t.end_hour + ":" + t.end_min + ":" + t.end_second;

      // $timeout(function() {
      // 	angular.element('#touTable').trigger('footable_redraw');
      // }, 10);

      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      EnergyStorageContainerScheduleService.addEnergyStorageContainerSchedule(
        $scope.currentEnergyStorageContainer.id,
        t,
        headers,
        function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {
                template: $translate.instant("SETTING.SCHEDULE"),
              }),
              showCloseButton: true,
            });
            $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID(
              $scope.currentEnergyStorageContainer.id
            );
            $scope.$emit("handleEmitEnergyStorageContainerScheduleChanged");
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                template: $translate.instant("SETTING.SCHEDULE"),
              }),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        }
      );
    };

    $scope.deleteEnergyStorageContainerSchedule = function (
      energystoragecontainerschedule
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
            EnergyStorageContainerScheduleService.deleteEnergyStorageContainerSchedule(
              $scope.currentEnergyStorageContainer.id,
              energystoragecontainerschedule.id,
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
                      template: $translate.instant("SETTING.SCHEDULE"),
                    }),
                    showCloseButton: true,
                  });
                  $scope.getEnergyStorageContainerSchedulesByEnergyStorageContainerID(
                    $scope.currentEnergyStorageContainer.id
                  );
                  $scope.$emit(
                    "handleEmitEnergyStorageContainerScheduleChanged"
                  );
                } else {
                  toaster.pop({
                    type: "error",
                    title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {
                      template: $translate.instant("SETTING.SCHEDULE"),
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
  "ModalAddEnergyStorageContainerScheduleCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.ADD_ENERGY_STORAGE_CONTAINER_SCHEDULE";
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainerschedule);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalEditEnergyStorageContainerScheduleCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation =
      "ENERGY_STORAGE_CONTAINER.EDIT_ENERGY_STORAGE_CONTAINER_SCHEDULE";
    $scope.energystoragecontainerschedule =
      params.energystoragecontainerschedule;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainerschedule);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);
