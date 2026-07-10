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
            $http.get(getAPI() + 'offlinemeterfiles/template/download')
                .then(function(response) {
                    if (response.status === 200 && response.data.excel_bytes_base64) {
                        var mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                        var fileName = 'offline_meter_data.xlsx';
                        // Decode base64 to blob
                        var byteCharacters = atob(response.data.excel_bytes_base64);
                        var byteArray = new Uint8Array(byteCharacters.length);
                        for (var i = 0; i < byteCharacters.length; i++) {
                            byteArray[i] = byteCharacters.charCodeAt(i);
                        }
                        var blob = new Blob([byteArray], { type: mimeType });
                        // Trigger download
                        var link = $window.document.createElement('a');
                        link.href = $window.URL.createObjectURL(blob);
                        link.download = fileName;
                        $window.document.body.appendChild(link);
                        link.click();
                        $window.document.body.removeChild(link);
                        $window.URL.revokeObjectURL(link.href);
                    }
                })
                .catch(function(error) {
                    console.error('Failed to download template:', error);
                });
        };
    }
]);
