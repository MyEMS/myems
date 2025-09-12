'use strict';

app.controller('TenantMasterController', function($scope) {
    // 租户变更事件（原有）
    $scope.$on('handleEmitTenantChanged', function(event) {
        $scope.$broadcast('handleBroadcastTenantChanged');
    });
    
    // 租户类型变更事件（新增）
    $scope.$on('handleEmitTenantTypeChanged', function(event) {
        // 广播租户类型变更事件给租户控制器
        $scope.$broadcast('handleBroadcastTenantTypeChanged');
    });
});
