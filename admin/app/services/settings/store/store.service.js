'use strict';
app.factory('StoreService', function($http) {
    return {
        getAllStores:function(callback){
            $http.get(getAPI()+'stores')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchStores: function(query, callback) {
            $http.get(getAPI()+'stores', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addStore: function(store, callback) {
            $http.post(getAPI()+'stores',{data:store})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editStore: function(store, callback) {
            $http.put(getAPI()+'stores/'+store.id,{data:store})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteStore: function(store, callback) {
            $http.delete(getAPI()+'stores/'+store.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
