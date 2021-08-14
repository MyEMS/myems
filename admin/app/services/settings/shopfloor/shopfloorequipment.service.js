'use strict';
app.factory('ShopfloorEquipmentService', function($http) {
    return {
        addPair: function(shopfloorID,equipmentID,callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/equipments',{data:{'equipment_id':equipmentID}})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(shopfloorID, equipmentID, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/equipments/'+equipmentID)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEquipmentsByShopfloorID: function(id, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/equipments')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
