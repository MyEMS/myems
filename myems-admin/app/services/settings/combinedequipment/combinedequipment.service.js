'use strict';

// Combined Equipment service - REST API wrapper
app.factory('CombinedEquipmentService', function($http) {
    return {
        // GET all combined equipments
        getAllCombinedEquipments:function(headers, callback){
            $http.get(getAPI()+'combinedequipments', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search combined equipments by query
        searchCombinedEquipments: function(query, headers, callback) {
            $http.get(getAPI()+'combinedequipments', {
                params: {q: query},
                headers: headers
            })
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create combined equipment
        addCombinedEquipment: function(combinedequipment, headers, callback) {
            $http.post(getAPI()+'combinedequipments',{data:combinedequipment}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update combined equipment
        editCombinedEquipment: function(combinedequipment, headers, callback) {
            $http.put(getAPI()+'combinedequipments/'+combinedequipment.id,{data:combinedequipment}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE combined equipment
        deleteCombinedEquipment: function(combinedequipment, headers, callback) {
            $http.delete(getAPI()+'combinedequipments/'+combinedequipment.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export combined equipment
        exportCombinedEquipment: function(combinedequipment, headers, callback) {
            $http.get(getAPI()+'combinedequipments/'+combinedequipment.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import combined equipment
        importCombinedEquipment: function(importdata, headers, callback) {
            $http.post(getAPI()+'combinedequipments/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone combined equipment
        cloneCombinedEquipment: function(combinedequipment, headers, callback) {
            $http.post(getAPI()+'combinedequipments/'+combinedequipment.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        }
    };
});
