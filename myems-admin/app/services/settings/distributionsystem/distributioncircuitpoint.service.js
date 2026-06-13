'use strict';

// Distribution Circuit Point service - REST API wrapper
app.factory('DistributionCircuitPointService', function($http) {
    return {
        // POST create pair
        addPair: function(distributioncircuitID,pointID, headers, callback) {
            $http.post(getAPI()+'distributioncircuits/'+distributioncircuitID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(distributioncircuitID,pointID, headers, callback) {
            $http.delete(getAPI()+'distributioncircuits/'+distributioncircuitID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET points by distribution circuit id by ID
        getPointsByDistributionCircuitID: function(id, headers, callback) {
            $http.get(getAPI()+'distributioncircuits/'+id+'/points', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
