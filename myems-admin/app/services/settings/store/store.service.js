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
        searchStores: function(query, callback) {
            $http.get(getAPI()+'stores', { params: { q: query } })
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
    };
});
