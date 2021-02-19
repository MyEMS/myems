'use strict';
app.factory('PointService', function($http) {  
    return {  
        getAllPoints:function(callback){
            $http.get(getAPI()+'points')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });
        },
        searchPoints: function(query, callback) {  
            $http.get(getAPI()+'points', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        addPoint: function(point, callback) {  
            $http.post(getAPI()+'points',{data:point})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        editPoint: function(point, callback) {  
            $http.put(getAPI()+'points/'+point.id,{data:point})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        deletePoint: function(point, callback) {  
            $http.delete(getAPI()+'points/'+point.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        },
        getPointsByDataSourceID: function(id, callback) {  
            $http.get(getAPI()+'datasources/'+id+'/points')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e,status) {  
                    callback(e,status);  
                });  
        }
    };
});  