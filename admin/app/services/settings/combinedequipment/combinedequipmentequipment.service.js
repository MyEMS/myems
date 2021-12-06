'use strict';
app.factory('CombinedEquipmentEquipmentService', function($http) {
    return {
        addPair: function(combinedequipmentID,equipmentID, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/equipments',{data:{'equipment_id':equipmentID}} ,{headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(combinedequipmentID, equipmentID, headers, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/equipments/'+equipmentID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEquipmentsByCombinedEquipmentID: function(id, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/equipments')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
