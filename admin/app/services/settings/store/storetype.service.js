'use strict';
app.factory('StoreTypeService', function($http) {
    return {
        getAllStoreTypes:function(callback){
            $http.get(getAPI()+'storetypes')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        searchStoreTypes: function(query, callback) {
            $http.get(getAPI()+'storetypes', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        addStoreType: function(store_type, callback) {
            $http.post(getAPI()+'storetypes',{data:store})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        editStoreType: function(store_type, callback) {
            $http.put(getAPI()+'storetypes/'+store_type.id,{data:store_type})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        deleteStoreType: function(store_type, callback) {
            $http.delete(getAPI()+'storetypes/'+store_type.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
    };
});
