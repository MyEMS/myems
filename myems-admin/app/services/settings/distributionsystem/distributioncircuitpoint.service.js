'use strict';
app.factory('DistributionCircuitPointService', function($http) {
    return {
        addPair: function(distributioncircuitID,pointID, headers, callback) {
            $http.post(getAPI()+'distributioncircuits/'+distributioncircuitID+'/points',{data:{'point_id':pointID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(distributioncircuitID,pointID, headers, callback) {
            $http.delete(getAPI()+'distributioncircuits/'+distributioncircuitID+'/points/'+pointID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
