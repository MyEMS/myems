'use strict';
app.factory('ShopfloorService', function($http) {
    return {
        getAllShopfloors:function(callback){
            $http.get(getAPI()+'shopfloors')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getAllTimezones:function(callback){
            $http.get(getAPI()+'timezones')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchShopfloors: function(query, callback) {
            $http.get(getAPI()+'shopfloors', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addShopfloor: function(shopfloor, headers, callback) {
            $http.post(getAPI()+'shopfloors',{data:shopfloor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editShopfloor: function(shopfloor, headers, callback) {
            $http.put(getAPI()+'shopfloors/'+shopfloor.id,{data:shopfloor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteShopfloor: function(shopfloor, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloor.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
