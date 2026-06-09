'use strict';

// Tariff service - REST API wrapper
app.factory('TariffService', function($http) {
    return {
        // GET all tariffs
        getAllTariffs:function(headers, callback){
            $http.get(getAPI()+'tariffs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search tariffs by query
        searchTariffs: function(query, headers, callback) {
            $http.get(getAPI()+'tariffs', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create tariff
        addTariff: function(tariff, headers, callback) {
            $http.post(getAPI()+'tariffs',{data:tariff}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update tariff
        editTariff: function(tariff, headers, callback) {
            $http.put(getAPI()+'tariffs/'+tariff.id,{data:tariff}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE tariff
        deleteTariff: function(tariff, headers, callback) {
            $http.delete(getAPI()+'tariffs/'+tariff.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export tariff
        exportTariff: function(tariff, headers, callback) {
            $http.get(getAPI()+'tariffs/'+tariff.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import tariff
        importTariff: function(importdata, headers, callback) {
            $http.post(getAPI()+'tariffs/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone tariff
        cloneTariff: function(tariff, headers, callback) {
            $http.post(getAPI()+'tariffs/'+tariff.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});