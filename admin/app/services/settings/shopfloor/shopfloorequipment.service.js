'use strict';
app.factory('ShopfloorEquipmentService', function($http) {
    return {
        addPair: function(shopfloorID,equipmentID,callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/equipments',{data:{'equipment_id':equipmentID}})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },

        deletePair: function(shopfloorID, equipmentID, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/equipments/'+equipmentID)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e) {
                    callback(e);
                });
        },
        getEquipmentsByShopfloorID: function(id, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/equipments')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e) {
                    callback(e);
                });
        }
    };
});
