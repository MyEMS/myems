'use strict';
app.factory('SpaceCombinedEquipmentService', function($http) {
    return {
        addPair: function(spaceID,combinedequipmentID,callback) {
            $http.post(getAPI()+'spaces/'+spaceID+'/combinedequipments',{data:{'combined_equipment_id':combinedequipmentID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(spaceID, combinedequipmentID, callback) {
            $http.delete(getAPI()+'spaces/'+spaceID+'/combinedequipments/'+combinedequipmentID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getCombinedEquipmentsBySpaceID: function(id, callback) {
            $http.get(getAPI()+'spaces/'+id+'/combinedequipments')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
