'use strict';

// Datarepairfile service - REST API wrapper
app.factory('DataRepairFileService', function($http) {  
    return {  
        // GET all data repair files
        getAllDataRepairFiles:function(headers, callback){
            $http.get(getAPI()+'datarepairfiles', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search data repair files by query
        searchDataRepairFiles: function(query, headers, callback) {  
            $http.get(getAPI()+'datarepairfiles', { params: { q: query } }, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // POST create data repair file
        addDataRepairFile: function(datarepairfile, headers, callback) {  
            $http.post(getAPI()+'datarepairfiles', {data:datarepairfile}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // API: restore data repair file
        restoreDataRepairFile: function (datarepairfile, headers, callback) {
            $http.get(getAPI() + 'datarepairfiles/' + datarepairfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE data repair file
        deleteDataRepairFile: function(datarepairfile, headers, callback) {  
            $http.delete(getAPI()+'datarepairfiles/' + datarepairfile.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // GET data repair file by ID
        getDataRepairFile: function(id, headers, callback) {  
            $http.get(getAPI()+'datarepairfiles/' + id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  