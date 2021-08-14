'use strict';
app.factory('PointService', function($http) {  
    return {  
        getAllPoints:function(callback){
            $http.get(getAPI()+'points')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchPoints: function(query, callback) {  
            $http.get(getAPI()+'points', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        addPoint: function(point, callback) {  
            $http.post(getAPI()+'points',{data:point})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        editPoint: function(point, callback) {  
            $http.put(getAPI()+'points/'+point.id,{data:point})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        },
        deletePoint: function(point, callback) {  
            $http.delete(getAPI()+'points/'+point.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        getPointsByDataSourceID: function(id, callback) {  
            $http.get(getAPI()+'datasources/'+id+'/points')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });  
        }
    };
});  