'use strict';

// Meter Command service - REST API wrapper
app.factory('MeterCommandService', function($http) {
    return {
        // POST create pair
        addPair: function(meterID,commandID, headers, callback) {
            $http.post(getAPI()+'meters/'+meterID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(meterID, commandID, headers, callback) {
            $http.delete(getAPI()+'meters/'+meterID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET commands by meter id by ID
        getCommandsByMeterID: function(id, headers, callback) {
            $http.get(getAPI()+'meters/'+id+'/commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});