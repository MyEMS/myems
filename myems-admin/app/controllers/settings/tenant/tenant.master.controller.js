'use strict';

app.controller('TenantMasterController', function($scope) {
    $scope.$on('handleEmitTenantChanged', function(event) {
        $scope.$broadcast('handleBroadcastTenantChanged');
    });
    
    $scope.$on('handleEmitTenantTypeChanged', function(event) {
        $scope.$broadcast('handleBroadcastTenantTypeChanged');
    });
});
