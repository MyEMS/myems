'use strict';
app.factory('StoreTypeService', function($http) {
    return {
        getAllStoreTypes:function(callback){
            $http.get(getAPI()+'storetypes')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchStoreTypes: function(query, callback) {
            $http.get(getAPI()+'storetypes', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addStoreType: function(store_type, callback) {
            $http.post(getAPI()+'storetypes',{data:store})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editStoreType: function(store_type, callback) {
            $http.put(getAPI()+'storetypes/'+store_type.id,{data:store_type})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteStoreType: function(store_type, callback) {
            $http.delete(getAPI()+'storetypes/'+store_type.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
