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
        searchDataRepairFiles: function(query, headers, callback) {  
            $http.get(getAPI()+'datarepairfiles', { params: { q: query } }, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        addDataRepairFile: function(datarepairfile, headers, callback) {  
            $http.post(getAPI()+'datarepairfiles', {data:datarepairfile}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        restoreDataRepairFile: function (datarepairfile, headers, callback) {
            $http.get(getAPI() + 'datarepairfiles/' + datarepairfile.id + '/restore', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteDataRepairFile: function(datarepairfile, headers, callback) {  
            $http.delete(getAPI()+'datarepairfiles/' + datarepairfile.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
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