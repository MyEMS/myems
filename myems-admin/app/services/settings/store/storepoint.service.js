'use strict';

// Store Point service - REST API wrapper
app.factory('StorePointService', function($http) {
    return {
        // POST create pair
        addPair: function(storeID,pointID, headers, callback) {
            $http.post(getAPI()+'stores/'+storeID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(storeID,pointID, headers, callback) {
            $http.delete(getAPI()+'stores/'+storeID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by store id by ID
        getPointsByStoreID: function(id, headers, callback) {
            $http.get(getAPI()+'stores/'+id+'/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
