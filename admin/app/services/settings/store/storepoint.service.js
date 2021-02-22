'use strict';
app.factory('StorePointService', function($http) {
    return {
        addPair: function(storeID,pointID,callback) {
            $http.post(getAPI()+'stores/'+storeID+'/points',{data:{'point_id':pointID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(storeID,pointID, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/points/'+pointID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getPointsByStoreID: function(id, callback) {
            $http.get(getAPI()+'stores/'+id+'/points')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
