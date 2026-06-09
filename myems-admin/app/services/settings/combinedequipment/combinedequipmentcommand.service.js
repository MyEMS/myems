'use strict';

// Combined Equipment Command service - REST API wrapper
app.factory('CombinedEquipmentCommandService', function($http) {
    return {
        // POST create pair
        addPair: function(combinedequipmentID,commandID, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(combinedequipmentID, commandID, headers, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET commands by combined equipment id by ID
        getCommandsByCombinedEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});