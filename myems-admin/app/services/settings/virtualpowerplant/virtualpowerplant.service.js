'use strict';
app.factory('VirtualPowerPlantService', function($http) {
    return {
        getAllVirtualPowerPlants:function(headers, callback){
            $http.get(getAPI()+'virtualpowerplants', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        searchVirtualPowerPlants: function(query, headers, callback) {
            $http.get(getAPI()+'virtualpowerplants', { params: { q: query } }, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.post(getAPI()+'virtualpowerplants',{data:virtualpowerplant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.put(getAPI()+'virtualpowerplants/'+virtualpowerplant.id,{data:virtualpowerplant}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        deleteVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.delete(getAPI()+'virtualpowerplants/'+virtualpowerplant.id, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        exportVirtualPowerPlant: function(virtualpowerplant, headers, callback) {
            $http.get(getAPI()+'virtualpowerplants/'+virtualpowerplant.id+'/export', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        importVirtualPowerPlant: function(importdata, headers, callback) {
            $http.post(getAPI()+'virtualpowerplants/import', JSON.parse(importdata), {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
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
