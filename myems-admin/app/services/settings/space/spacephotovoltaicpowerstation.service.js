'use strict';

// Space Photovoltaic Power Station service - REST API wrapper
app.factory('SpacePhotovoltaicPowerStationService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,photovoltaicpowerstationID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/photovoltaicpowerstations',{data:{'photovoltaic_power_station_id':photovoltaicpowerstationID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, photovoltaicpowerstationID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/photovoltaicpowerstations/'+photovoltaicpowerstationID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET photovoltaic power stations by space id by ID
        getPhotovoltaicPowerStationsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/photovoltaicpowerstations', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
