'use strict';
app.factory('TariffService', function($http) {  
    return {  
        getAllTariffs:function(callback){
            $http.get(getAPI()+'tariffs')  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchTariffs: function(query, callback) {  
            $http.get(getAPI()+'tariffs', { params: { q: query } })  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        },
        addTariff: function(tariff, callback) {  
            $http.post(getAPI()+'tariffs',{data:tariff})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editTariff: function(tariff, callback) {  
            $http.put(getAPI()+'tariffs/'+tariff.id,{data:tariff})  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteTariff: function(tariff, callback) {  
            $http.delete(getAPI()+'tariffs/'+tariff.id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getTariff: function(id, callback) {  
            $http.get(getAPI()+'tariffs/'+id)  
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            }); 
        }
    };
});  