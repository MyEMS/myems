'use strict';
app.factory('TariffService', function($http) {
    return {
        getAllTariffs:function(headers, callback){
            $http.get(getAPI()+'tariffs', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
        addTariff: function(tariff, headers, callback) {
            $http.post(getAPI()+'tariffs',{data:tariff}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editTariff: function(tariff, headers, callback) {
            $http.put(getAPI()+'tariffs/'+tariff.id,{data:tariff}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteTariff: function(tariff, headers, callback) {
            $http.delete(getAPI()+'tariffs/'+tariff.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportTariff: function(tariff, headers, callback) {
            $http.get(getAPI()+'tariffs/'+tariff.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importTariff: function(importdata, headers, callback) {
            $http.post(getAPI()+'tariffs/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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