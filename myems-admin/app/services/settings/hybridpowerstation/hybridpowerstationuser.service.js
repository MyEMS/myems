'use strict';
app.factory('HybridPowerStationUserService', function($http) {
    return {
        addPair: function(hybridpowerstationID,userID, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+hybridpowerstationID+'/users',{data:{'user_id':userID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(hybridpowerstationID,userID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+hybridpowerstationID+'/users/'+userID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getUsersByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/users', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
