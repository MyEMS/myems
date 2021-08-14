'use strict';
app.factory('SpaceStoreService', function($http) {
    return {
        addPair: function(spaceID,storeID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/stores',{data:{'store_id':storeID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, storeID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/stores/'+storeID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getStoresBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/stores')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
