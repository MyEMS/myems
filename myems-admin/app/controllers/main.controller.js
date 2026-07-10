'use strict';
app.controller('MainController', [
    '$rootScope', '$location', '$window', '$timeout', '$cookies', '$http',
    function($rootScope, $location, $window, $timeout, $cookies, $http) {

        $rootScope.$on("handleReLogin",function(){
            $timeout(function(){
                $window.localStorage.removeItem("myems_admin_ui_current_user");
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

        // Download offline meter template file
        $rootScope.downloadOfflineMeterTemplate = function() {
            var url = getAPI() + 'offlinemeterfiles/template/download';
            fetch(url)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status);
                    }
                    return response.blob();
                })
                .then(function(blob) {
                    var link = $window.document.createElement('a');
                    link.href = $window.URL.createObjectURL(blob);
                    link.download = 'offline_meter_data.xlsx';
                    $window.document.body.appendChild(link);
                    link.click();
                    $window.document.body.removeChild(link);
                    $window.URL.revokeObjectURL(link.href);
                })
                .catch(function(error) {
                    console.error('Failed to download template:', error);
                    alert('模板下载失败，请稍后重试');
                });
        };
    }
]);
