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
        searchEquipments: function(query, headers, callback) {
            $http.get(getAPI()+'equipments', {
                params: { q: query },
                headers: headers
            })
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
        exportEquipment: function(equipment, headers, callback) {
            $http.get(getAPI()+'equipments/'+equipment.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importEquipment: function(importdata, headers, callback) {
            $http.post(getAPI()+'equipments/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        cloneEquipment: function(equipment, headers, callback) {
            $http.post(getAPI()+'equipments/'+equipment.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
