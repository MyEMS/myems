'use strict';
app.factory('DataRepairFileService', function($http) {  
    return {  
        getAllDataRepairFiles:function(headers, callback){
            $http.get(getAPI()+'datarepairfiles', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchDataRepairFile: function(query, headers, callback) {  
            $http.get(getAPI()+'datarepairfiles', { params: { q: query } }, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        addDataRepairFile: function(offlinemeterfile, headers, callback) {  
            $http.post(getAPI()+'datarepairfiles', {data:offlinemeterfile}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        restoreDataRepairFile: function (offlinemeterfile, headers, callback) {
            $http.get(getAPI() + 'datarepairfiles/' + offlinemeterfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteDataRepairFile: function(offlinemeterfile, headers, callback) {  
            $http.delete(getAPI()+'datarepairfiles/' + offlinemeterfile.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getDataRepairFiles: function(id, headers, callback) {  
            $http.get(getAPI()+'datarepairfiles/' + id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  