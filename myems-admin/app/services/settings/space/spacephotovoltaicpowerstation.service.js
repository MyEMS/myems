'use strict';
app.factory('SpacePhotovoltaicPowerStationService', function($http) {
    return {
        addPair: function(spaceID,photovoltaicpowerstationID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/photovoltaicpowerstations',{data:{'photovoltaic_power_station_id':photovoltaicpowerstationID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, photovoltaicpowerstationID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/photovoltaicpowerstations/'+photovoltaicpowerstationID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
