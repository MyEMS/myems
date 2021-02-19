'use strict';
app.controller('MainController', [
    '$rootScope', '$location', '$window', '$timeout','$cookies',
    function($rootScope, $location, $window, $timeout,$cookies) {
        $rootScope.$on("handleStateChange",function(event,args){
            var cur_path = $location.$$path;
            if (cur_path.indexOf('login')==-1) {
                var admin_path = ["settings", "users",  "fdd/rule"];
                var req_admin = false;
                admin_path.forEach(function(elm){
                    if (cur_path.indexOf(elm) !=-1) {
                        req_admin = true;
                    }
                });
                if (req_admin) {
                    var currentUser = undefined;
                    if ($window.localStorage.getItem("currentUser")){
                        currentUser = JSON.parse($window.localStorage.getItem("currentUser"));
                    }
                    if (currentUser != undefined && currentUser.is_admin ==true) {
                        $rootScope.pageTitle=args;
                    }else{
                        $window.localStorage.removeItem("currentUser");
                        $location.path('/login');
                    }
                }else{
                    $rootScope.pageTitle=args;
                }

            }
        });

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

        $rootScope.isAdminCookie=function(){
            // var admin_uuid="dfa793a3-1a1d-49be-ad46-99f4196079de";
            // var cur_cookie="dfa793a3-1a1d-49be-ad46-99f4196079de";
            var currentUser = undefined;
            if ($window.localStorage.getItem("currentUser")){
                currentUser = JSON.parse($window.localStorage.getItem("currentUser"));
            }
            if (currentUser != undefined && currentUser.is_admin ==true) {
                return true;
            }else{
                return false;
            }
            // if(cur_cookie==admin_uuid){
            //     return true;
            // }else{
            //     return false;
            // }
        }
    }
]);
