'use strict';
app.factory('EmailServerService', function($http) {
    return {
        getAllEmailServers:function(callback){
            $http.get(getAPI()+'emailservers')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchEmailServers: function(query, callback) {
            $http.get(getAPI()+'emailservers', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addEmailServer: function(emailserver, callback) {
            $http.post(getAPI()+'emailservers',{data:emailserver})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editEmailServer: function(emailserver, callback) {
            $http.put(getAPI()+'emailservers/'+emailserver.id,{data:emailserver})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteEmailServer: function(emailserver, callback) {
            $http.delete(getAPI()+'emailservers/'+emailserver.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getEmailServer: function(id, callback) {
            $http.get(getAPI()+'emailservers/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
