'use strict';

// Space Combined Equipment service - REST API wrapper
app.factory('SpaceCombinedEquipmentService', function($http) {
    return {
        // POST create pair
        addPair: function(spaceID,combinedequipmentID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/combinedequipments',{data:{'combined_equipment_id':combinedequipmentID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(spaceID, combinedequipmentID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/combinedequipments/'+combinedequipmentID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET combined equipments by space id by ID
        getCombinedEquipmentsBySpaceID: function(id, headers, callback) {
            $http.get(getAPI()+'spaces/'+id+'/combinedequipments', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
