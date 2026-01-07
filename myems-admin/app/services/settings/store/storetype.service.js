'use strict';
app.factory('StoreTypeService', function($http) {
    return {
        getAllStoreTypes:function(headers, callback){
            $http.get(getAPI()+'storetypes', {headers})
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
        addStoreType: function(store_type, headers, callback) {
            $http.post(getAPI()+'storetypes',{data:store_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editStoreType: function(store_type, headers, callback) {
            $http.put(getAPI()+'storetypes/'+store_type.id,{data:store_type}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
