'use strict';
app.factory('EquipmentCommandService', function($http) {
    return {
        addPair: function(equipmentID,commandID, headers, callback) {
            $http.post(getAPI()+'equipments/'+equipmentID+'/commands',{data:{'command_id':commandID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(equipmentID, commandID, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipmentID+'/commands/'+commandID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCommandsByEquipmentID: function(id, callback) {
            $http.get(getAPI()+'equipments/'+id+'/commands')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});