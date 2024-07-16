'use strict';
app.factory('ProtocolService', function($http) {
    return {
        getAllProtocols:function(headers, callback){
            $http.get(getAPI() + 'protocols', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchProtocols: function(query, headers, callback) {
            $http.get(getAPI() + 'protocols', {params:{q:query}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addProtocol: function(protocol, headers, callback) {
            $http.post(getAPI() + 'protocols', {data:protocol}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editProtocol: function(protocol, headers, callback) {
            $http.put(getAPI() + 'protocols/' + protocol.id, {data:protocol}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteProtocol: function(protocol, headers, callback) {
            $http.delete(getAPI() + 'protocols/' + protocol.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getProtocol: function(id, headers, callback) {
            $http.get(getAPI() + 'protocols/' + id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportProtocol: function(protocol, headers, callback) {
            $http.get(getAPI()+'protocols/'+protocol.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importProtocol: function(importdata, headers, callback) {
            $http.post(getAPI()+'protocols/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneProtocol: function(protocol, headers, callback) {
            $http.post(getAPI()+'protocols/'+protocol.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});