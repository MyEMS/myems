'use strict';
app.factory('FlatService', function($http) {  
    return {  
        getAllFlats:function(callback){
            $http.get(getAPI()+'flats')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });
        },
        searchFlats: function(query, callback) {  
            $http.get(getAPI()+'flats', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        addFlat: function(flat, callback) {  
            $http.post(getAPI()+'flats',{data:flat})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        editFlat: function(flat, callback) {  
            $http.put(getAPI()+'flats/'+flat.id,{data:flat})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        deleteFlat: function(flat, callback) {  
            $http.delete(getAPI()+'flats/'+flat.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        getFlat: function(id, callback) {  
            $http.get(getAPI()+'flats/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        }
    };
});  