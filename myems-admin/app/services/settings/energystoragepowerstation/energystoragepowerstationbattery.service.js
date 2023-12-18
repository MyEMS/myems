'use strict';
app.factory('EnergyStoragePowerStationBatteryService', function($http) {
    return {
        getAllEnergyStoragePowerStationBatteries: function(headers, callback) {
            $http.get(getAPI()+'energystoragepowerstationbatteries', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        getEnergyStoragePowerStationBatteriesByEnergyStoragePowerStationID: function(id, headers, callback) {
            $http.get(getAPI()+'energystoragepowerstations/'+id+'/batteries', {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        addEnergyStoragePowerStationBattery: function(id, energystoragepowerstationbattery, headers, callback) {
            $http.post(getAPI()+'energystoragepowerstations/'+id+'/batteries',{data:energystoragepowerstationbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
        editEnergyStoragePowerStationBattery: function(id, energystoragepowerstationbattery, headers, callback) {
            $http.put(getAPI()+'energystoragepowerstations/'+id+'/batteries/'+energystoragepowerstationbattery.id,{data:energystoragepowerstationbattery}, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },

        deleteEnergyStoragePowerStationBattery: function(id, energystoragepowerstationbatteryID, headers, callback) {
            $http.delete(getAPI()+'energystoragepowerstations/'+id+'/batteries/'+energystoragepowerstationbatteryID, {headers})
            .then(function (response) {
                callback(response);
            }, function (response) {
                callback(response);
            });
        },
    };
});
