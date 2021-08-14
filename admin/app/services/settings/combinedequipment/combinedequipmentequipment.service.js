'use strict';
app.factory('CombinedEquipmentEquipmentService', function($http) {
    return {
        addPair: function(combinedequipmentID,equipmentID,callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/equipments',{data:{'equipment_id':equipmentID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(combinedequipmentID, equipmentID, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/equipments/'+equipmentID)
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
