'use strict';

// Data Source service - REST API wrapper
app.factory('DataSourceService', function($http) {
    return {
        // GET all data sources
        getAllDataSources:function(headers, callback){
            $http.get(getAPI() + 'datasources', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search data sources by query
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
        // POST create data source
        addDataSource: function(datasource, headers, callback) {
            $http.post(getAPI()+'datasources', {data:datasource}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update data source
        editDataSource: function(datasource, headers, callback) {
            $http.put(getAPI()+'datasources/' + datasource.id, {data:datasource}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE data source
        deleteDataSource: function(datasource, headers, callback) {
            $http.delete(getAPI()+'datasources/' + datasource.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET data source by ID
        getDataSource: function(id, headers, callback) {
            $http.get(getAPI()+'datasources/' + id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export data source
        exportDataSource: function(datasource, headers, callback) {
            $http.get(getAPI()+'datasources/'+datasource.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import data source
        importDataSource: function(importdata, headers, callback) {
            $http.post(getAPI()+'datasources/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone data source
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