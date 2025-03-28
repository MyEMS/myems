'use strict';
app.factory('SpaceHybridPowerStationService', function($http) {
    return {
        addPair: function(spaceID,hybridpowerstationID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/hybridpowerstations',{data:{'hybrid_power_station_id':hybridpowerstationID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, hybridpowerstationID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/hybridpowerstations/'+hybridpowerstationID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getHybridPowerStationsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/hybridpowerstations', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
