'use strict';
app.factory('ShopfloorService', function($http) {
    return {
        getAllShopfloors:function(headers, callback){
            $http.get(getAPI()+'shopfloors', {headers})
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
        searchShopfloors: function(query, headers, callback) {
            $http.get(getAPI()+'shopfloors', { params: { q: query },headers: headers })
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
        },
        exportShopfloor: function(shopfloor, headers, callback) {
            $http.get(getAPI()+'shopfloors/'+shopfloor.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importShopfloor: function(importdata, headers, callback) {
            $http.post(getAPI()+'shopfloors/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneShopfloor: function(shopfloor, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloor.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
