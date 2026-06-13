'use strict';

// Store Type service - REST API wrapper
app.factory('StoreTypeService', function($http) {
    return {
        // GET all store types
        getAllStoreTypes:function(headers, callback){
            $http.get(getAPI()+'storetypes', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search store types by query
        searchStoreTypes: function(query, callback) {
            $http.get(getAPI()+'storetypes', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create store type
        addStoreType: function(store_type, headers, callback) {
            $http.post(getAPI()+'storetypes',{data:store_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update store type
        editStoreType: function(store_type, headers, callback) {
            $http.put(getAPI()+'storetypes/'+store_type.id,{data:store_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE store type
        deleteStoreType: function(store_type, headers, callback) {
            $http.delete(getAPI()+'storetypes/'+store_type.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
