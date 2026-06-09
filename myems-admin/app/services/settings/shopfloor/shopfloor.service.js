'use strict';

// Shop Floor service - REST API wrapper
app.factory('ShopfloorService', function($http) {
    return {
        // GET all shopfloors
        getAllShopfloors:function(headers, callback){
            $http.get(getAPI()+'shopfloors', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET all timezones
        getAllTimezones:function(callback){
            $http.get(getAPI()+'timezones')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search shopfloors by query
        searchShopfloors: function(query, headers, callback) {
            $http.get(getAPI()+'shopfloors', { params: { q: query },headers: headers })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create shopfloor
        addShopfloor: function(shopfloor, headers, callback) {
            $http.post(getAPI()+'shopfloors',{data:shopfloor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update shopfloor
        editShopfloor: function(shopfloor, headers, callback) {
            $http.put(getAPI()+'shopfloors/'+shopfloor.id,{data:shopfloor}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE shopfloor
        deleteShopfloor: function(shopfloor, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloor.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export shopfloor
        exportShopfloor: function(shopfloor, headers, callback) {
            $http.get(getAPI()+'shopfloors/'+shopfloor.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import shopfloor
        importShopfloor: function(importdata, headers, callback) {
            $http.post(getAPI()+'shopfloors/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone shopfloor
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
