'use strict';

// Photovoltaic Power Station User service - REST API wrapper
app.factory('PhotovoltaicPowerStationUserService', function($http) {
    return {
        // POST create pair
        addPair: function(photovoltaicpowerstationID,userID, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstationID+'/users',{data:{'user_id':userID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(photovoltaicpowerstationID,userID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstationID+'/users/'+userID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET users by photovoltaic power station id by ID
        getUsersByPhotovoltaicPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'photovoltaicpowerstations/'+id+'/users', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
