'use strict';
app.factory('OfflineMeterService', function($http) {
    return {
        getAllOfflineMeters:function(headers, callback){
            $http.get(getAPI()+'offlinemeters', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
        addOfflineMeter: function(offlinemeter, headers, callback) {
            $http.post(getAPI()+'offlinemeters',{data:offlinemeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editOfflineMeter: function(offlinemeter, headers, callback) {
            $http.put(getAPI()+'offlinemeters/'+offlinemeter.id,{data:offlinemeter}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteOfflineMeter: function(offlinemeter, headers, callback) {
            $http.delete(getAPI()+'offlinemeters/'+offlinemeter.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getOfflineMeter: function(id, headers, callback) {
            $http.get(getAPI()+'offlinemeters/'+id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportOfflineMeter: function(offlinemeter, headers, callback) {
            $http.get(getAPI()+'offlinemeters/'+offlinemeter.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importOfflineMeter: function(importdata, headers, callback) {
            $http.post(getAPI()+'offlinemeters/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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