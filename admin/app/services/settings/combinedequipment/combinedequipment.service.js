'use strict';
app.factory('CombinedEquipmentService', function($http) {
    return {
        getAllCombinedEquipments:function(callback){
            $http.get(getAPI()+'combinedequipments')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        searchCombinedEquipments: function(query, callback) {
            $http.get(getAPI()+'combinedequipments', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        addCombinedEquipment: function(combinedequipment, callback) {
            $http.post(getAPI()+'combinedequipments',{data:combinedequipment})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        editCombinedEquipment: function(combinedequipment, callback) {
            $http.put(getAPI()+'combinedequipments/'+combinedequipment.id,{data:combinedequipment})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        deleteCombinedEquipment: function(combinedequipment, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipment.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        getCombinedEquipment: function(id, callback) {
            $http.get(getAPI()+'combinedequipments/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
