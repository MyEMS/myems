'use strict';
app.factory('SpaceStoreService', function($http) {
    return {
        addPair: function(spaceID,storeID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/stores',{data:{'store_id':storeID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(spaceID, storeID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/stores/'+storeID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getStoresBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/stores')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
