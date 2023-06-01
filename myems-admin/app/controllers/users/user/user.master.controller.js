app.controller('UserMasterController', function ($scope) {
    
    $scope.$on('handleEmitNewUserChanged', function(event) {
        $scope.$broadcast('handleBroadcastNewUserChanged');
    });    
});
