'use strict';

// Protocol service - REST API wrapper
app.factory('ProtocolService', function($http) {
    return {
        // GET all protocols
        getAllProtocols:function(headers, callback){
            $http.get(getAPI() + 'protocols', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search protocols by query
        searchProtocols: function(query, headers, callback) {
            $http.get(getAPI() + 'protocols', {params:{q:query}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create protocol
        addProtocol: function(protocol, headers, callback) {
            $http.post(getAPI() + 'protocols', {data:protocol}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update protocol
        editProtocol: function(protocol, headers, callback) {
            $http.put(getAPI() + 'protocols/' + protocol.id, {data:protocol}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE protocol
        deleteProtocol: function(protocol, headers, callback) {
            $http.delete(getAPI() + 'protocols/' + protocol.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET protocol by ID
        getProtocol: function(id, headers, callback) {
            $http.get(getAPI() + 'protocols/' + id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export protocol
        exportProtocol: function(protocol, headers, callback) {
            $http.get(getAPI()+'protocols/'+protocol.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import protocol
        importProtocol: function(importdata, headers, callback) {
            $http.post(getAPI()+'protocols/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone protocol
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