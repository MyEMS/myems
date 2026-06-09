'use strict';

// Space Store service - REST API wrapper
app.factory('SpaceStoreService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,storeID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/stores',{data:{'store_id':storeID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, storeID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/stores/'+storeID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET stores by space id by ID
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
