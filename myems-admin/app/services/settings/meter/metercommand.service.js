'use strict';
app.factory('MeterCommandService', function($http) {
    return {
        addPair: function(meterID,commandID, headers, callback) {
            $http.post(getAPI()+'meters/'+meterID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(meterID, commandID, headers, callback) {
            $http.delete(getAPI()+'meters/'+meterID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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