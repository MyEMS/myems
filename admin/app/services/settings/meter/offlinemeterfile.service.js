'use strict';
app.factory('OfflineMeterFileService', function($http) {  
    return {  
        getAllOfflineMeterFiles:function(headers, callback){
            $http.get(getAPI()+'offlinemeterfiles', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchOfflineMeterFiles: function(query, headers, callback) {  
            $http.get(getAPI()+'offlinemeterfiles', { params: { q: query } }, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        addOfflineMeterFile: function(offlinemeterfile, headers, callback) {  
            $http.post(getAPI()+'offlinemeterfiles', {data:offlinemeterfile}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        restoreOfflineMeterFile: function (offlinemeterfile, headers, callback) {
            $http.get(getAPI() + 'offlinemeterfiles/' + offlinemeterfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteOfflineMeterFile: function(offlinemeterfile, headers, callback) {  
            $http.delete(getAPI()+'offlinemeterfiles/' + offlinemeterfile.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
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