'use strict';

var TENANT_TAB_INDEXES = {
    TENANT: 0,
    TENANT_TYPE: 1,
    BIND_METER: 2,
    BIND_POINT: 3,
    BIND_SENSOR: 4,
    BIND_WORKING_CALENDAR: 5,
    BIND_COMMAND: 6
};

app.controller('TenantMasterController', function($scope, $timeout) {
    $scope.TAB_INDEXES = TENANT_TAB_INDEXES;
    $scope.activeTabIndex = TENANT_TAB_INDEXES.TENANT;

    $scope.handleTabSelect = function(tabIndex) {
        $scope.activeTabIndex = tabIndex;
        $timeout(function() {
            $scope.$broadcast('tenant.tabSelected', tabIndex);
        }, 0);
    };

    $scope.$on('handleEmitTenantChanged', function(event) {
        $scope.$broadcast('handleBroadcastTenantChanged');
    });
    
    $scope.$on('handleEmitTenantTypeChanged', function(event) {
        $scope.$broadcast('handleBroadcastTenantTypeChanged');
    });
});
