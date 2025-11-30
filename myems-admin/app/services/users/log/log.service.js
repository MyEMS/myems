'use strict';
app.factory('LogService', function($http) {
    return {
        getLogs: function(headers, callback) {
            let config = { headers: headers };
            $http.get(getAPI() + 'logs', config)
                .then(function (response) {
                    callback(response);
                }, function (response) {
                    callback(response);
                });
        }
    };
});


