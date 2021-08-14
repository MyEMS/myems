'use strict';
app.factory('CombinedEquipmentService', function($http) {
    return {
        getAllCombinedEquipments:function(callback){
            $http.get(getAPI()+'combinedequipments')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchCombinedEquipments: function(query, callback) {
            $http.get(getAPI()+'combinedequipments', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addCombinedEquipment: function(combinedequipment, callback) {
            $http.post(getAPI()+'combinedequipments',{data:combinedequipment})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editCombinedEquipment: function(combinedequipment, callback) {
            $http.put(getAPI()+'combinedequipments/'+combinedequipment.id,{data:combinedequipment})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteCombinedEquipment: function(combinedequipment, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipment.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getCombinedEquipment: function(id, callback) {
            $http.get(getAPI()+'combinedequipments/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
