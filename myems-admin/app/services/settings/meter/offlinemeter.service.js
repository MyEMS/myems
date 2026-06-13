'use strict';

// Offline Meter service - REST API wrapper
app.factory('OfflineMeterService', function($http) {
    return {
        // GET all offline meters
        getAllOfflineMeters:function(headers, callback){
            $http.get(getAPI()+'offlinemeters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search offline meters by query
        searchOfflineMeters: function(query, headers,callback) {
            $http.get(getAPI()+'offlinemeters', {
                params: { q: query },
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create offline meter
        addOfflineMeter: function(offlinemeter, headers, callback) {
            $http.post(getAPI()+'offlinemeters',{data:offlinemeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update offline meter
        editOfflineMeter: function(offlinemeter, headers, callback) {
            $http.put(getAPI()+'offlinemeters/'+offlinemeter.id,{data:offlinemeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE offline meter
        deleteOfflineMeter: function(offlinemeter, headers, callback) {
            $http.delete(getAPI()+'offlinemeters/'+offlinemeter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET offline meter by ID
        getOfflineMeter: function(id, headers, callback) {
            $http.get(getAPI()+'offlinemeters/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export offline meter
        exportOfflineMeter: function(offlinemeter, headers, callback) {
            $http.get(getAPI()+'offlinemeters/'+offlinemeter.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import offline meter
        importOfflineMeter: function(importdata, headers, callback) {
            $http.post(getAPI()+'offlinemeters/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone offline meter
        cloneOfflineMeter: function(offlinemeter, headers, callback) {
            $http.post(getAPI()+'offlinemeters/'+offlinemeter.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});