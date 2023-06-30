'use strict';
app.factory('SpaceStoreService', function($http) {
    return {
        addPair: function(spaceID,storeID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/stores',{data:{'store_id':storeID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, storeID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/stores/'+storeID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getStoresBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/stores', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
