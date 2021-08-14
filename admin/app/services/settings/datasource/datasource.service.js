'use strict';
app.factory('DataSourceService', function($http) {  
    return {  
        getAllDataSources:function(callback){
            $http.get(getAPI()+'datasources')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchDataSources: function(query, callback) {  
            $http.get(getAPI()+'datasources', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        addDataSource: function(datasource, callback) {  
            $http.post(getAPI()+'datasources',{data:datasource})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        editDataSource: function(datasource, callback) {  
            $http.put(getAPI()+'datasources/'+datasource.id,{data:datasource})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        deleteDataSource: function(datasource, callback) {  
            $http.delete(getAPI()+'datasources/'+datasource.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        getDataSource: function(id, callback) {  
            $http.get(getAPI()+'datasources/'+id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        }
    };
});  