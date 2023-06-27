'use strict';
app.factory('EquipmentService', function($http) {
    return {
        getAllEquipments:function(headers, callback){
            $http.get(getAPI()+'equipments', {headers})
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
        addEquipment: function(equipment, headers, callback) {
            $http.post(getAPI()+'equipments',{data:equipment}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEquipment: function(equipment, headers, callback) {
            $http.put(getAPI()+'equipments/'+equipment.id,{data:equipment}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteEquipment: function(equipment, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipment.id, {headers})
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
