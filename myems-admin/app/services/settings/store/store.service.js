'use strict';
app.factory('StoreService', function($http) {
    return {
        getAllStores:function(headers, callback){
            $http.get(getAPI()+'stores', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchStores: function(query, headers, callback) {
            $http.get(getAPI()+'stores', { params: { q: query },headers: headers })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addStore: function(store, headers, callback) {
            $http.post(getAPI()+'stores',{data:store}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editStore: function(store, headers, callback) {
            $http.put(getAPI()+'stores/'+store.id,{data:store}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteStore: function(store, headers, callback) {
            $http.delete(getAPI()+'stores/'+store.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportStore: function(store, headers, callback) {
            $http.get(getAPI()+'stores/'+store.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importStore: function(importdata, headers, callback) {
            $http.post(getAPI()+'stores/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
