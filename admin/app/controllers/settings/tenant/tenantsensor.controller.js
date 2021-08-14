'use strict';

app.controller('TenantSensorController', function ($scope, $translate, TenantService, SensorService, TenantSensorService,  toaster, SweetAlert) {
    $scope.currentTenant = {selected:undefined};

    $scope.getAllSensors = function () {
      SensorService.getAllSensors(function (response) {
          if (angular.isDefined(response.status) && response.status === 200) {
              $scope.sensors = response.data;
          } else {
              $scope.sensors = [];
          }
      });
    };

    $scope.getSensorsByTenantID = function (id) {
        TenantSensorService.getSensorsByTenantID(id, function (response) {
            if (angular.isDefined(response.status) && response.status === 200) {
                $scope.tenantsensors = response.data;
            } else {
                $scope.tenantsensors = [];
            }
        });
    };

  $scope.changeTenant=function(item,model){
  	$scope.currentTenant=item;
  	$scope.currentTenant.selected=model;
  	$scope.getSensorsByTenantID($scope.currentTenant.id);
  };

  $scope.getAllTenants = function () {
    TenantService.getAllTenants(function (response) {
        if (angular.isDefined(response.status) && response.status === 200) {
            $scope.tenants = response.data;
        } else {
            $scope.tenants = [];
        }
    });
  };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var tenantid = $scope.currentTenant.id;
        TenantSensorService.addPair(tenantid, sensorid, function (response) {
            if (angular.isDefined(response.status) && response.status === 201) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.BIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByTenantID($scope.currentTenant.id);
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.deleteSensorPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var tenantsensorid = angular.element('#' + dragEl).scope().tenantsensor.id;
        var tenantid = $scope.currentTenant.id;
        TenantSensorService.deletePair(tenantid, tenantsensorid, function (response) {
            if (angular.isDefined(response.status) && response.status === 204) {
                toaster.pop({
                    type: "success",
                    title: $translate.instant("TOASTER.SUCCESS_TITLE"),
                    body: $translate.instant("TOASTER.UNBIND_SENSOR_SUCCESS"),
                    showCloseButton: true,
                });
                $scope.getSensorsByTenantID($scope.currentTenant.id);
            } else {
                toaster.pop({
                    type: "error",
                    title: $translate.instant(response.data.title),
                    body: $translate.instant(response.data.description),
                    showCloseButton: true,
                });
            }
        });
    };

    $scope.getAllSensors();
    $scope.getAllTenants();

  	$scope.$on('handleBroadcastTenantChanged', function(event) {
      $scope.getAllTenants();
  	});
});
