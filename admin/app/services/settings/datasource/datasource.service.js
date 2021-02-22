'use strict';
app.factory('DataSourceService', function($http) {  
    return {  
        getAllDataSources:function(callback){
            $http.get(getAPI()+'datasources')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });
        },
        searchDataSources: function(query, callback) {  
            $http.get(getAPI()+'datasources', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        addDataSource: function(datasource, callback) {  
            $http.post(getAPI()+'datasources',{data:datasource})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        editDataSource: function(datasource, callback) {  
            $http.put(getAPI()+'datasources/'+datasource.id,{data:datasource})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        deleteDataSource: function(datasource, callback) {  
            $http.delete(getAPI()+'datasources/'+datasource.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        getDataSource: function(id, callback) {  
            $http.get(getAPI()+'datasources/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        }
    };
});  