'use strict';
app.factory('EquipmentService', function($http) {
    return {
        getAllEquipments:function(callback){
            $http.get(getAPI()+'equipments')
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchEquipments: function(query, callback) {
            $http.get(getAPI()+'equipments', { params: { q: query } })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEquipment: function(equipment, callback) {
            $http.post(getAPI()+'equipments',{data:equipment})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEquipment: function(equipment, callback) {
            $http.put(getAPI()+'equipments/'+equipment.id,{data:equipment})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEquipment: function(equipment, callback) {
            $http.delete(getAPI()+'equipments/'+equipment.id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEquipment: function(id, callback) {
            $http.get(getAPI()+'equipments/'+id)
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
