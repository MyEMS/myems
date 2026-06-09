'use strict';

// Combined Equipment Equipment service - REST API wrapper
app.factory('CombinedEquipmentEquipmentService', function($http) {
    return {
        // POST create pair
        addPair: function(combinedequipmentID,equipmentID, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/equipments', {data:{'equipment_id':equipmentID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(combinedequipmentID, equipmentID, headers, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/equipments/'+equipmentID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET equipments by combined equipment id by ID
        getEquipmentsByCombinedEquipmentID: function(id, headers, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/equipments', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
