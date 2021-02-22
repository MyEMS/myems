'use strict';
app.factory('TariffService', function($http) {  
    return {  
        getAllTariffs:function(callback){
            $http.get(getAPI()+'tariffs')  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });
        },
        searchTariffs: function(query, callback) {  
            $http.get(getAPI()+'tariffs', { params: { q: query } })  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        addTariff: function(tariff, callback) {  
            $http.post(getAPI()+'tariffs',{data:tariff})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        editTariff: function(tariff, callback) {  
            $http.put(getAPI()+'tariffs/'+tariff.id,{data:tariff})  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        deleteTariff: function(tariff, callback) {  
            $http.delete(getAPI()+'tariffs/'+tariff.id)  
                .success(function (response, status, headers, config) {  
                    callback(null, status);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        },
        getTariff: function(id, callback) {  
            $http.get(getAPI()+'tariffs/'+id)  
                .success(function (response, status, headers, config) {  
                    callback(null, response);  
                })  
                .error(function (e) {  
                    callback(e);  
                });  
        }
    };
});  