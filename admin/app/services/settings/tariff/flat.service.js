'use strict';
app.factory('FlatService', function($http) {  
    return {  
        getAllFlats:function(callback){
            $http.get(getAPI()+'flats')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchFlats: function(query, callback) {  
            $http.get(getAPI()+'flats', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addFlat: function(flat, callback) {  
            $http.post(getAPI()+'flats',{data:flat})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editFlat: function(flat, callback) {  
            $http.put(getAPI()+'flats/'+flat.id,{data:flat})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteFlat: function(flat, callback) {  
            $http.delete(getAPI()+'flats/'+flat.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getFlat: function(id, callback) {  
            $http.get(getAPI()+'flats/'+id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});  