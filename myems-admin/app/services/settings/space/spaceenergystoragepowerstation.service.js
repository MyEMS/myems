'use strict';
app.factory('SpaceEnergyStoragePowerStationService', function($http) {
    return {
        addPair: function(spaceID,energystoragepowerstationID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/energystoragepowerstations',{data:{'energy_storage_power_station_id':energystoragepowerstationID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, energystoragepowerstationID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/energystoragepowerstations/'+energystoragepowerstationID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStoragePowerStationsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/energystoragepowerstations', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
