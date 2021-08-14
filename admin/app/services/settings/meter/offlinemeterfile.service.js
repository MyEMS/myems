'use strict';
app.factory('OfflineMeterFileService', function($http) {  
    return {  
        getAllOfflineMeterFiles:function(callback){
            $http.get(getAPI()+'offlinemeterfiles')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchOfflineMeterFiles: function(query, callback) {  
            $http.get(getAPI()+'offlinemeterfiles', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        addOfflineMeterFile: function(offlinemeterfile, callback) {  
            $http.post(getAPI()+'offlinemeterfiles',{data:offlinemeterfile})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        editOfflineMeterFile: function(offlinemeterfile, callback) {  
            $http.put(getAPI()+'offlinemeterfiles/'+offlinemeterfile.id,{data:offlinemeterfile})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        restoreOfflineMeterFile: function (offlinemeterfile, callback) {
            $http.get(getAPI() + 'offlinemeterfiles/' + offlinemeterfile.id + '/restore')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteOfflineMeterFile: function(offlinemeterfile, callback) {  
            $http.delete(getAPI()+'offlinemeterfiles/'+offlinemeterfile.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getOfflineMeterFile: function(id, callback) {  
            $http.get(getAPI()+'offlinemeterfiles/'+id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  