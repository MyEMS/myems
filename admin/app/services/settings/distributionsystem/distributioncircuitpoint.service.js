'use strict';
app.factory('DistributionCircuitPointService', function($http) {
    return {
        addPair: function(distributioncircuitID,pointID,callback) {
            $http.post(getAPI()+'distributioncircuits/'+distributioncircuitID+'/points',{data:{'point_id':pointID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(distributioncircuitID,pointID, callback) {
            $http.delete(getAPI()+'distributioncircuits/'+distributioncircuitID+'/points/'+pointID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getPointsByDistributionCircuitID: function(id, callback) {
            $http.get(getAPI()+'distributioncircuits/'+id+'/points')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
