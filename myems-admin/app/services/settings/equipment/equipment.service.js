'use strict';

// Equipment service - REST API wrapper
app.factory('EquipmentService', function($http) {
    return {
        // GET all equipments
        getAllEquipments:function(headers, callback){
            $http.get(getAPI()+'equipments', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search equipments by query
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
        // POST create equipment
        addEquipment: function(equipment, headers, callback) {
            $http.post(getAPI()+'equipments',{data:equipment}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update equipment
        editEquipment: function(equipment, headers, callback) {
            $http.put(getAPI()+'equipments/'+equipment.id,{data:equipment}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE equipment
        deleteEquipment: function(equipment, headers, callback) {
            $http.delete(getAPI()+'equipments/'+equipment.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export equipment
        exportEquipment: function(equipment, headers, callback) {
            $http.get(getAPI()+'equipments/'+equipment.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import equipment
        importEquipment: function(importdata, headers, callback) {
            $http.post(getAPI()+'equipments/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone equipment
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
