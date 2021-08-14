'use strict';
app.factory('DistributionCircuitPointService', function($http) {
    return {
        addPair: function(distributioncircuitID,pointID,callback) {
            $http.post(getAPI()+'distributioncircuits/'+distributioncircuitID+'/points',{data:{'point_id':pointID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(distributioncircuitID,pointID, callback) {
            $http.delete(getAPI()+'distributioncircuits/'+distributioncircuitID+'/points/'+pointID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getPointsByDistributionCircuitID: function(id, callback) {
            $http.get(getAPI()+'distributioncircuits/'+id+'/points')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
