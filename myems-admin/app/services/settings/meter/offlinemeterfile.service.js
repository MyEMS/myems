'use strict';

// Offline Meter File service - REST API wrapper
app.factory('OfflineMeterFileService', function($http) {  
    return {  
        // GET all offline meter files
        getAllOfflineMeterFiles:function(headers, callback){
            $http.get(getAPI()+'offlinemeterfiles', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search offline meter files by query
        searchOfflineMeterFiles: function(query, headers, callback) {  
            $http.get(getAPI()+'offlinemeterfiles', { params: { q: query } }, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // POST create offline meter file
        addOfflineMeterFile: function(offlinemeterfile, headers, callback) {  
            $http.post(getAPI()+'offlinemeterfiles', {data:offlinemeterfile}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // API: restore offline meter file
        restoreOfflineMeterFile: function (offlinemeterfile, headers, callback) {
            $http.get(getAPI() + 'offlinemeterfiles/' + offlinemeterfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE offline meter file
        deleteOfflineMeterFile: function(offlinemeterfile, headers, callback) {  
            $http.delete(getAPI()+'offlinemeterfiles/' + offlinemeterfile.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // GET offline meter file by ID
        getOfflineMeterFile: function(id, headers, callback) {  
            $http.get(getAPI()+'offlinemeterfiles/' + id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  