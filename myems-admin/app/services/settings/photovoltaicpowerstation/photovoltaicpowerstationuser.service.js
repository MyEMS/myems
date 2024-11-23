'use strict';
app.factory('PhotovoltaicPowerStationUserService', function($http) {
    return {
        addPair: function(photovoltaicpowerstationID,userID, headers, callback) {
            $http.post(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstationID+'/users',{data:{'user_id':userID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(photovoltaicpowerstationID,userID, headers, callback) {
            $http.delete(getAPI()+'photovoltaicpowerstations/'+photovoltaicpowerstationID+'/users/'+userID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
