'use strict';
app.factory('EquipmentService', function($http) {
    return {
        getAllEquipments:function(callback){
            $http.get(getAPI()+'equipments')
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        searchEquipments: function(query, callback) {
            $http.get(getAPI()+'equipments', { params: { q: query } })
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        addEquipment: function(equipment, callback) {
            $http.post(getAPI()+'equipments',{data:equipment})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        editEquipment: function(equipment, callback) {
            $http.put(getAPI()+'equipments/'+equipment.id,{data:equipment})
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        deleteEquipment: function(equipment, callback) {
            $http.delete(getAPI()+'equipments/'+equipment.id)
                .success(function (response, status, headers, config) {
                    callback(null, status);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        },
        getEquipment: function(id, callback) {
            $http.get(getAPI()+'equipments/'+id)
                .success(function (response, status, headers, config) {
                    callback(null, response);
                })
                .error(function (e,status) {
                    callback(e,status);
                });
        }
    };
});
