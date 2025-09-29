'use strict';
app.factory('DataSourceService', function($http) {
    return {
        getAllDataSources:function(headers, callback){
            $http.get(getAPI() + 'datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchDataSources: function(query, headers, callback) {
            $http.get(getAPI()+'datasources', {
                params: { q: query },
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addDataSource: function(datasource, headers, callback) {
            $http.post(getAPI()+'datasources', {data:datasource}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editDataSource: function(datasource, headers, callback) {
            $http.put(getAPI()+'datasources/' + datasource.id, {data:datasource}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteDataSource: function(datasource, headers, callback) {
            $http.delete(getAPI()+'datasources/' + datasource.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getDataSource: function(id, headers, callback) {
            $http.get(getAPI()+'datasources/' + id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportDataSource: function(datasource, headers, callback) {
            $http.get(getAPI()+'datasources/'+datasource.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importDataSource: function(importdata, headers, callback) {
            $http.post(getAPI()+'datasources/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneDataSource: function(datasource, headers, callback) {
            $http.post(getAPI()+'datasources/'+datasource.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});