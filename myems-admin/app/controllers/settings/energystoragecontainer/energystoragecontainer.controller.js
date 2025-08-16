"use strict";

app.controller(
  "EnergyStorageContainerController",
  function (
    $scope,
    $rootScope,
    $window,
    $translate,
    $uibModal,
    CostCenterService,
    ContactService,
    EnergyStorageContainerService,
    PointService,
    toaster,
    SweetAlert
  ) {
    $scope.cur_user = JSON.parse(
      $window.localStorage.getItem("myems_admin_ui_current_user")
    );
    $scope.getAllCostCenters = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      CostCenterService.getAllCostCenters(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.costcenters = response.data;
        } else {
          $scope.costcenters = [];
        }
      });
    };

    $scope.getAllContacts = function () {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        Token: $scope.cur_user.token,
      };
      ContactService.getAllContacts(headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.contacts = response.data;
        } else {
          $scope.contacts = [];
        }
      });
    };

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
    
    $scope.exportEnergyStorageContainer = function (container) {
      let headers = {
        "User-UUID": $scope.cur_user.uuid,
        "Token": $scope.cur_user.token,
      };
      EnergyStorageContainerService.exportEnergyStorageContainer(container, headers, function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
          $scope.exportdata = JSON.stringify(response.data); 
          var modalInstance = $uibModal.open({
            windowClass: "animated fadeIn",
            templateUrl: "views/common/export.html",
            controller: "ModalExportCtrl",
            resolve: {
              params: function () {
                return {
                  exportdata: angular.copy($scope.exportdata),
                };
              },
            },
          });
          $rootScope.modalInstance = modalInstance;
        } else {
          $scope.exportdata = null;
        }
      });
    };
    $scope.importEnergyStorageContainer = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'views/common/import.html',
        controller: 'ModalImportCtrl',
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {};
          }
        }
      });

      modalInstance.result.then(function (importdata) {
        let headers = { 
          "User-UUID": $scope.cur_user.uuid, 
          "Token": $scope.cur_user.token 
        };
        EnergyStorageContainerService.importEnergyStorageContainer(importdata, headers, function (response) {
          if (angular.isDefined(response.status) && response.status === 201) {
            toaster.pop({
              type: "success",
              title: $translate.instant("TOASTER.SUCCESS_TITLE"),
              body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {
                template: $translate.instant("COMMON.ENERGY_STORAGE_CONTAINER")
              }),
              showCloseButton: true,
            });
            $scope.getAllEnergyStorageContainers();
            $scope.$emit('handleEmitEnergyStorageContainerChanged');
          } else {
            toaster.pop({
              type: "error",
              title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                template: $translate.instant("COMMON.ENERGY_STORAGE_CONTAINER")
              }),
              body: $translate.instant(response.data.description),
              showCloseButton: true,
            });
          }
        });
      }, function () {
        // do nothing
      });

      $rootScope.modalInstance = modalInstance;
    };

    $scope.cloneEnergyStorageContainer = function(energystoragecontainer){
		let headers = { "User-UUID": $scope.cur_user.uuid, "Token": $scope.cur_user.token };
		EnergyStorageContainerService.cloneEnergyStorageContainer(energystoragecontainer, headers, function(response) {
			if (angular.isDefined(response.status) && response.status === 201) {
				toaster.pop({
					type: "success",
					title: $translate.instant("TOASTER.SUCCESS_TITLE"),
					body: $translate.instant("TOASTER.SUCCESS_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_CONTAINER")}),
					showCloseButton: true,
				});
				$scope.getAllEnergyStorageContainers();
				$scope.$emit('handleEmitEnergyStorageContainerChanged');
			}else {
				toaster.pop({
					type: "error",
					title: $translate.instant("TOASTER.ERROR_ADD_BODY", {template: $translate.instant("COMMON.ENERGY_STORAGE_CONTAINER")}),
					body: $translate.instant(response.data.description),
					showCloseButton: true,
				});
			}
		});
	};

    $scope.addEnergyStorageContainer = function () {
      var modalInstance = $uibModal.open({
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainer.model.html",
        controller: "ModalAddEnergyStorageContainerCtrl",
        windowClass: "animated fadeIn",
        resolve: {
          params: function () {
            return {
              costcenters: angular.copy($scope.costcenters),
              contacts: angular.copy($scope.contacts),
            };
          },
        },
      });
      modalInstance.result.then(
        function (energystoragecontainer) {
          energystoragecontainer.cost_center_id =
            energystoragecontainer.cost_center.id;
          energystoragecontainer.contact_id = energystoragecontainer.contact.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerService.addEnergyStorageContainer(
            energystoragecontainer,
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
                      "COMMON.ENERGY_STORAGE_CONTAINER"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.$emit("handleEmitEnergyStorageContainerChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_ADD_BODY", {
                    template: $translate.instant(
                      "COMMON.ENERGY_STORAGE_CONTAINER"
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

    $scope.editEnergyStorageContainer = function (energystoragecontainer) {
      var modalInstance = $uibModal.open({
        windowClass: "animated fadeIn",
        templateUrl:
          "views/settings/energystoragecontainer/energystoragecontainer.model.html",
        controller: "ModalEditEnergyStorageContainerCtrl",
        resolve: {
          params: function () {
            return {
              energystoragecontainer: angular.copy(energystoragecontainer),
              costcenters: angular.copy($scope.costcenters),
              contacts: angular.copy($scope.contacts),
            };
          },
        },
      });

      modalInstance.result.then(
        function (modifiedEnergyStorageContainer) {
          modifiedEnergyStorageContainer.cost_center_id =
            modifiedEnergyStorageContainer.cost_center.id;
          modifiedEnergyStorageContainer.contact_id =
            modifiedEnergyStorageContainer.contact.id;

          let headers = {
            "User-UUID": $scope.cur_user.uuid,
            Token: $scope.cur_user.token,
          };
          EnergyStorageContainerService.editEnergyStorageContainer(
            modifiedEnergyStorageContainer,
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
                      "COMMON.ENERGY_STORAGE_CONTAINER"
                    ),
                  }),
                  showCloseButton: true,
                });
                $scope.$emit("handleEmitEnergyStorageContainerChanged");
              } else {
                toaster.pop({
                  type: "error",
                  title: $translate.instant("TOASTER.ERROR_UPDATE_BODY", {
                    template: $translate.instant(
                      "COMMON.ENERGY_STORAGE_CONTAINER"
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

    $scope.deleteEnergyStorageContainer = function (energystoragecontainer) {
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
            EnergyStorageContainerService.deleteEnergyStorageContainer(
              energystoragecontainer,
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
                        "COMMON.ENERGY_STORAGE_CONTAINER"
                      ),
                    }),
                    showCloseButton: true,
                  });
                  $scope.$emit("handleEmitEnergyStorageContainerChanged");
                } else {
                  toaster.pop({
                    type: "error",
                    title: $translate.instant("TOASTER.ERROR_DELETE_BODY", {
                      template: $translate.instant(
                        "COMMON.ENERGY_STORAGE_CONTAINER"
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
    $scope.getAllCostCenters();
    $scope.getAllContacts();
    $scope.$on(
      "handleBroadcastEnergyStorageContainerChanged",
      function (event) {
        $scope.getAllEnergyStorageContainers();
      }
    );
  }
);

app.controller(
  "ModalAddEnergyStorageContainerCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation = "SETTING.ADD_ENERGY_STORAGE_CONTAINER";
    $scope.costcenters = params.costcenters;
    $scope.contacts = params.contacts;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainer);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);

app.controller(
  "ModalEditEnergyStorageContainerCtrl",
  function ($scope, $uibModalInstance, params) {
    $scope.operation = "SETTING.EDIT_ENERGY_STORAGE_CONTAINER";
    $scope.energystoragecontainer = params.energystoragecontainer;
    $scope.costcenters = params.costcenters;
    $scope.contacts = params.contacts;
    $scope.ok = function () {
      $uibModalInstance.close($scope.energystoragecontainer);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  }
);
