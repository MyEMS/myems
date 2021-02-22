'use strict';
app.factory('StoreService', function($http) {
    return {
        getAllStores:function(callback){
            $http.get(getAPI()+'stores')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchStores: function(query, callback) {
            $http.get(getAPI()+'stores', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addStore: function(store, callback) {
            $http.post(getAPI()+'stores',{data:store})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editStore: function(store, callback) {
            $http.put(getAPI()+'stores/'+store.id,{data:store})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteStore: function(store, callback) {
            $http.delete(getAPI()+'stores/'+store.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
    };
});
