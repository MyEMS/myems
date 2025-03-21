'use strict';
app.factory('HybridPowerStationCommandService', function($http) {
    return {
        addPair: function(hybridpowerstationID,commandID, headers, callback) {
            $http.post(getAPI()+'hybridpowerstations/'+hybridpowerstationID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(hybridpowerstationID, commandID, headers, callback) {
            $http.delete(getAPI()+'hybridpowerstations/'+hybridpowerstationID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCommandsByHybridPowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'hybridpowerstations/'+id+'/commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});