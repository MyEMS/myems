'use strict';
app.factory('PointService', function($http) {  
    return {  
        getAllPoints:function(headers, callback){
            $http.get(getAPI() + 'points', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchPoints: function(query, headers, callback) {  
            $http.get(getAPI()+'points', {params:{q:query}}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        addPoint: function(point, headers, callback) {  
            $http.post(getAPI()+'points', {data:point}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        editPoint: function(point, headers, callback) {  
            $http.put(getAPI()+'points/' + point.id, {data:point}, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        deletePoint: function(point, headers, callback) {  
            $http.delete(getAPI() + 'points/' + point.id, {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getPointsByDataSourceID: function(id, headers, callback) {  
            $http.get(getAPI() + 'datasources/' + id + '/points', {headers})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        exportPoint: function(point, headers, callback) {
            $http.get(getAPI()+'points/'+point.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importPoint: function(importdata, headers, callback) {
            $http.post(getAPI()+'points/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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