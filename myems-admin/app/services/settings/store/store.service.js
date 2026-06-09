'use strict';

// Store service - REST API wrapper
app.factory('StoreService', function($http) {
    return {
        // GET all stores
        getAllStores:function(headers, callback){
            $http.get(getAPI()+'stores', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search stores by query
        searchStores: function(query, headers, callback) {
            $http.get(getAPI()+'stores', { params: { q: query },headers: headers })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create store
        addStore: function(store, headers, callback) {
            $http.post(getAPI()+'stores',{data:store}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update store
        editStore: function(store, headers, callback) {
            $http.put(getAPI()+'stores/'+store.id,{data:store}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE store
        deleteStore: function(store, headers, callback) {
            $http.delete(getAPI()+'stores/'+store.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export store
        exportStore: function(store, headers, callback) {
            $http.get(getAPI()+'stores/'+store.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import store
        importStore: function(importdata, headers, callback) {
            $http.post(getAPI()+'stores/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone store
        cloneStore: function(store, headers, callback) {
            $http.post(getAPI()+'stores/'+store.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
