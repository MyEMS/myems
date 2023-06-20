'use strict';
app.factory('ShopfloorEquipmentService', function($http) {
    return {
        addPair: function(shopfloorID,equipmentID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/equipments',{data:{'equipment_id':equipmentID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deletePair: function(shopfloorID, equipmentID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/equipments/'+equipmentID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEquipmentsByShopfloorID: function(id, headers, callback) {
            $http.get(getAPI()+'shopfloors/'+id+'/equipments', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
