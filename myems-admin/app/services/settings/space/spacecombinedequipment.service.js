'use strict';
app.factory('SpaceCombinedEquipmentService', function($http) {
    return {
        addPair: function(spaceID,combinedequipmentID, headers, callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/combinedequipments',{data:{'combined_equipment_id':combinedequipmentID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(spaceID, combinedequipmentID, headers, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/combinedequipments/'+combinedequipmentID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
