'use strict';
app.factory('CombinedEquipmentEquipmentService', function($http) {
    return {
        addPair: function(combinedequipmentID,equipmentID,callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipmentID+'/equipments',{data:{'equipment_id':equipmentID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(combinedequipmentID, equipmentID, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipmentID+'/equipments/'+equipmentID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getEquipmentsByCombinedEquipmentID: function(id, callback) {
            $http.get(getAPI()+'combinedequipments/'+id+'/equipments')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
