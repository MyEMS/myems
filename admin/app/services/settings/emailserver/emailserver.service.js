'use strict';
app.factory('EmailServerService', function($http) {
    return {
        getAllEmailServers:function(callback){
            $http.get(getAPI()+'emailservers')
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
        addEmailServer: function(emailserver, callback) {
            $http.post(getAPI()+'emailservers',{data:emailserver})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEmailServer: function(emailserver, callback) {
            $http.put(getAPI()+'emailservers/'+emailserver.id,{data:emailserver})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEmailServer: function(emailserver, callback) {
            $http.delete(getAPI()+'emailservers/'+emailserver.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEmailServer: function(id, callback) {
            $http.get(getAPI()+'emailservers/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
