'use strict';

// Equipment Command service - REST API wrapper
app.factory('EquipmentCommandService', function($http) {
    return {
        // POST create pair
        addPair: function(equipmentID,commandID, headers, callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(equipmentID, commandID, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET commands by equipment id by ID
        getCommandsByEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'equipments/'+id+'/commands', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});