'use strict';

// Virtual Power Plant service - REST API wrapper
app.factory('VirtualPowerPlantService', function($http) {
    return {
        // GET all virtual power plants
        getAllVirtualPowerPlants:function(headers, callback){
            $http.get(getAPI()+'virtualpowerplants', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // Search virtual power plants by query
        searchVirtualPowerPlants: function(query, headers, callback) {
            $http.get(getAPI()+'virtualpowerplants', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST create virtual power plant
        addVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.post(getAPI()+'virtualpowerplants',{data:virtualpowerplant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // PUT update virtual power plant
        editVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.put(getAPI()+'virtualpowerplants/'+virtualpowerplant.id,{data:virtualpowerplant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // DELETE virtual power plant
        deleteVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.delete(getAPI()+'virtualpowerplants/'+virtualpowerplant.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // GET export virtual power plant
        exportVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.get(getAPI()+'virtualpowerplants/'+virtualpowerplant.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST import virtual power plant
        importVirtualPowerPlant: function(importdata, headers, callback) {
            $http.post(getAPI()+'virtualpowerplants/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        // POST clone virtual power plant
        cloneVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.post(getAPI()+'virtualpowerplants/'+virtualpowerplant.id+'/clone', {data:null}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
