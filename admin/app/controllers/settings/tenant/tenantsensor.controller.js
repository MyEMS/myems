'use strict';

app.controller('TenantSensorController', function ($scope, $common, $uibModal, $timeout, $translate, TenantService, SensorService, TenantSensorService,  toaster, SweetAlert) {
    $scope.currentTenant = {selected:undefined};

    $scope.getAllSensors = function () {
      SensorService.getAllSensors(function (error, data) {
          if (!error) {
              $scope.sensors = data;
          } else {
              $scope.sensors = [];
          }
      });
    };

    $scope.getSensorsByTenantID = function (id) {
        TenantSensorService.getSensorsByTenantID(id, function (error, data) {
            if (!error) {
                $scope.tenantsensors = data;
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
    TenantService.getAllTenants(function (error, data) {
        if (!error) {
            $scope.tenants = data;
        } else {
            $scope.tenants = [];
        }
    });
  };

    $scope.pairSensor = function (dragEl, dropEl) {
        var sensorid = angular.element('#' + dragEl).scope().sensor.id;
        var tenantid = $scope.currentTenant.id;
        TenantSensorService.addPair(tenantid, sensorid, function (error, status) {
            if (angular.isDefined(status) && status == 201) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.BIND_SENSOR_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getSensorsByTenantID($scope.currentTenant.id);
            } else {
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
            }
        });
    };

    $scope.deleteSensorPair = function (dragEl, dropEl) {
        if (angular.element('#' + dragEl).hasClass('source')) {
            return;
        }
        var tenantsensorid = angular.element('#' + dragEl).scope().tenantsensor.id;
        var tenantid = $scope.currentTenant.id;
        TenantSensorService.deletePair(tenantid, tenantsensorid, function (error, status) {
            if (angular.isDefined(status) && status == 204) {

                var popType = 'TOASTER.SUCCESS';
                var popTitle = $common.toaster.success_title;
                var popBody = 'TOASTER.UNBIND_SENSOR_SUCCESS';

                popType = $translate.instant(popType);
                popTitle = $translate.instant(popTitle);
                popBody = $translate.instant(popBody);

                toaster.pop({
                    type: popType,
                    title: popTitle,
                    body: popBody,
                    showCloseButton: true,
                });

                $scope.getSensorsByTenantID($scope.currentTenant.id);
            } else {
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
            }
        });
    };

    $scope.getAllSensors();
    $scope.getAllTenants();

  	$scope.$on('handleBroadcastTenantChanged', function(event) {
      $scope.getAllTenants();
  	});
});
