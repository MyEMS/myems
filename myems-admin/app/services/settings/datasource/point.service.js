'use strict';

// Point service - REST API wrapper
app.factory('PointService', function($http) {  
    return {  
        // GET all points
        getAllPoints:function(headers, callback){
            $http.get(getAPI() + 'points', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search points by query
        searchPoints: function(query, dataSourceId, headers, callback) {  
            const params = {};
            if (query) {
                params.q = query;
            }
            if (dataSourceId) {
                params.data_source_id = dataSourceId;
            }
            $http.get(getAPI()+'points', {params, headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // POST create point
        addPoint: function(point, headers, callback) {  
            $http.post(getAPI()+'points', {data:point}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // PUT update point
        editPoint: function(point, headers, callback) {  
            $http.put(getAPI()+'points/' + point.id, {data:point}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // DELETE point
        deletePoint: function(point, headers, callback) {  
            $http.delete(getAPI() + 'points/' + point.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        // GET points by data source id by ID
        getPointsByDataSourceID: function(id, headers, callback) {  
            $http.get(getAPI() + 'datasources/' + id + '/points', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        // GET export point
        exportPoint: function(point, headers, callback) {
            $http.get(getAPI()+'points/'+point.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import point
        importPoint: function(importdata, headers, callback) {
            $http.post(getAPI()+'points/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone point
        clonePoint: function(point, headers, callback) {
            $http.post(getAPI()+'points/'+point.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});  