'use strict';
app.factory('EmailServerService', function($http) {
    return {
        getAllEmailServers:function(headers, callback){
            $http.get(getAPI()+'emailservers', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchEmailServers: function(query, callback) {
            $http.get(getAPI()+'emailservers', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEmailServer: function(emailserver, headers, callback) {
            $http.post(getAPI()+'emailservers', {data:emailserver}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEmailServer: function(emailserver, headers, callback) {
            $http.put(getAPI()+'emailservers/' + emailserver.id, {data:emailserver}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEmailServer: function(emailserver, headers, callback) {
            $http.delete(getAPI()+'emailservers/' + emailserver.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
