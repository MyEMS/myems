'use strict';
app.factory('SpaceCombinedEquipmentService', function($http) {
    return {
        addPair: function(spaceID,combinedequipmentID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/combinedequipments',{data:{'combined_equipment_id':combinedequipmentID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, combinedequipmentID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/combinedequipments/'+combinedequipmentID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCombinedEquipmentsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/combinedequipments')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
