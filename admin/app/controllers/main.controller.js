'use strict';
app.controller('MainController', [
    '$rootScope', '$location', '$window', '$timeout','$cookies',
    function($rootScope, $location, $window, $timeout,$cookies) {
        
        $rootScope.$on("handleReLogin",function(){
            $timeout(function(){
                $window.localStorage.removeItem("currentUser");
                $location.path('/login');
            },2000)
        });

        $rootScope.$on('handleEmitWebMessageTableChanged', function(event) {
            $rootScope.$broadcast('BroadcastResetWebMessage');
        });

        $rootScope.$on('handleEmitWebMessageOptionChanged', function(event, args) {
            if(args.load){
                $rootScope.$broadcast('BroadcastResetWebMessage');
            }

        });

        $rootScope.bufferToStr=function(buffer){
            return String.fromCharCode.apply(null, new Uint8Array(buffer));
        };
    }
]);
