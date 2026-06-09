'use strict';

// Shop Floor Equipment service - REST API wrapper
app.factory('ShopfloorEquipmentService', function($http) {
    return {
        // POST create pair
        addPair: function(shopfloorID,equipmentID, headers, callback) {
            $http.post(getAPI()+'shopfloors/'+shopfloorID+'/equipments',{data:{'equipment_id':equipmentID}}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        // DELETE pair
        deletePair: function(shopfloorID, equipmentID, headers, callback) {
            $http.delete(getAPI()+'shopfloors/'+shopfloorID+'/equipments/'+equipmentID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET equipments by shopfloor id by ID
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
