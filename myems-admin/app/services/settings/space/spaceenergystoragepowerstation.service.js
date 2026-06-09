'use strict';

// Space Energy Storage Power Station service - REST API wrapper
app.factory('SpaceEnergyStoragePowerStationService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,energystoragepowerstationID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/energystoragepowerstations',{data:{'energy_storage_power_station_id':energystoragepowerstationID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, energystoragepowerstationID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/energystoragepowerstations/'+energystoragepowerstationID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET energy storage power stations by space id by ID
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
