'use strict';
app.factory('ShopfloorService', function($http) {
    return {
        getAllShopfloors:function(callback){
            $http.get(getAPI()+'shopfloors')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getAllTimezones:function(callback){
            $http.get(getAPI()+'timezones')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchShopfloors: function(query, callback) {
            $http.get(getAPI()+'shopfloors', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addShopfloor: function(shopfloor, callback) {
            $http.post(getAPI()+'shopfloors',{data:shopfloor})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editShopfloor: function(shopfloor, callback) {
            $http.put(getAPI()+'shopfloors/'+shopfloor.id,{data:shopfloor})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteShopfloor: function(shopfloor, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloor.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
