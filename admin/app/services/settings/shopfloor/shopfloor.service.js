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
        addShopfloor: function(shopfloor, callback) {
            $http.post(getAPI()+'shopfloors',{data:shopfloor})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editShopfloor: function(shopfloor, callback) {
            $http.put(getAPI()+'shopfloors/'+shopfloor.id,{data:shopfloor})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteShopfloor: function(shopfloor, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloor.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
