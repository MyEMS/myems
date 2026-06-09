'use strict';

// Email Server service - REST API wrapper
app.factory('EmailServerService', function($http) {
    return {
        // GET all email servers
        getAllEmailServers:function(headers, callback){
            $http.get(getAPI()+'emailservers', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search email servers by query
        searchEmailServers: function(query, callback) {
            $http.get(getAPI()+'emailservers', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create email server
        addEmailServer: function(emailserver, headers, callback) {
            $http.post(getAPI()+'emailservers', {data:emailserver}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update email server
        editEmailServer: function(emailserver, headers, callback) {
            $http.put(getAPI()+'emailservers/' + emailserver.id, {data:emailserver}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE email server
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
