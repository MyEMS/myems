'use strict';
app.factory('CombinedEquipmentCommandService', function($http) {
    return {
        addPair: function(combinedequipmentID,commandID, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(combinedequipmentID, commandID, headers, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCommandsByCombinedEquipmentID: function(id, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/commands')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});